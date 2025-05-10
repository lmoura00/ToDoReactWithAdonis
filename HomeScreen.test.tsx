import React from 'react';
import { render, fireEvent, act, waitFor, screen } from '@testing-library/react-native';
import { AuthContext } from './src/context/user-context';
import {HomeScreen} from './src/pages/home';
import axios from 'axios';
import { api } from './src/api';

jest.mock('axios');
jest.mock('lottie-react-native', () => 'LottieView');

const mockTasks = [
  {
    id: 1,
    title: 'Tarefa 1',
    description: 'Descrição 1',
    done: false,
    userId: 1,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  {
    id: 2,
    title: 'Tarefa 2',
    description: 'Descrição 2',
    done: true,
    userId: 1,
    createdAt: '2023-01-02',
    updatedAt: '2023-01-02',
  },
];

const mockAuthContext = {
  user: { id: 1, name: 'Usuário Teste', email: 'teste@example.com' },
  token: 'mock-token',
  login: jest.fn(),
  logout: jest.fn(),
};

describe('HomeScreen', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: mockTasks });
    (axios.post as jest.Mock).mockResolvedValue({ data: mockTasks[0] });
    (axios.delete as jest.Mock).mockResolvedValue({});
    (axios.patch as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <HomeScreen navigation={{}} />
      </AuthContext.Provider>
    );
  };

  it('deve renderizar corretamente', async () => {
    renderComponent();

    expect(screen.getByText('Bem vindo(a), Usuário Teste')).toBeTruthy();
    expect(axios.get).toHaveBeenCalledWith(`${api}task`, {
      headers: { Authorization: 'Bearer mock-token' },
    });

    await waitFor(() => {
      expect(screen.getByText('Tarefa 1')).toBeTruthy();
      expect(screen.getByText('Tarefa 2')).toBeTruthy();
    });
  });

  it('deve mostrar loading inicial', () => {
    renderComponent();
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  it('deve lidar com erro ao carregar tarefas', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Erro de rede'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Falha ao carregar tarefas')).toBeTruthy();
      expect(screen.getByText('Tentar novamente')).toBeTruthy();
    });
  });

  it('deve recarregar tarefas ao pressionar tentar novamente', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Erro de rede')).mockResolvedValueOnce({ data: mockTasks });
    renderComponent();

    await waitFor(() => {
      fireEvent.press(screen.getByText('Tentar novamente'));
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(screen.getByText('Tarefa 1')).toBeTruthy();
    });
  });

  it('deve adicionar uma nova tarefa', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.press(screen.getByText('+'));
      fireEvent.changeText(screen.getByPlaceholderText('Título da Tarefa'), 'Nova Tarefa');
      fireEvent.changeText(
        screen.getByPlaceholderText('Descrição da Tarefa (opcional)'),
        'Nova Descrição'
      );
      fireEvent.press(screen.getByText('Adicionar Tarefa'));
    });

    expect(axios.post).toHaveBeenCalledWith(
      `${api}task`,
      {
        title: 'Nova Tarefa',
        description: 'Nova Descrição',
      },
      {
        headers: { Authorization: 'Bearer mock-token' },
      }
    );
  });

  it('não deve adicionar tarefa com título vazio', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.press(screen.getByText('+'));
      fireEvent.changeText(screen.getByPlaceholderText('Título da Tarefa'), '');
      fireEvent.press(screen.getByText('Adicionar Tarefa'));
    });

    expect(axios.post).not.toHaveBeenCalled();
    expect(screen.getByText('Título não pode estar em branco!')).toBeTruthy();
  });

  it('deve filtrar tarefas por status', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.press(screen.getByText('Pendentes'));
    });

    await waitFor(() => {
      expect(screen.getByText('Tarefa 1')).toBeTruthy();
      expect(screen.queryByText('Tarefa 2')).toBeNull();
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Concluídas'));
    });

    await waitFor(() => {
      expect(screen.queryByText('Tarefa 1')).toBeNull();
      expect(screen.getByText('Tarefa 2')).toBeTruthy();
    });
  });

  it('deve buscar tarefas', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.changeText(screen.getByPlaceholderText('Buscar tarefas...'), 'Tarefa 1');
    });

    await waitFor(() => {
      expect(screen.getByText('Tarefa 1')).toBeTruthy();
      expect(screen.queryByText('Tarefa 2')).toBeNull();
    });
  });

  it('deve alternar status da tarefa', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.press(screen.getAllByText('Concluir')[0]);
    });

    expect(axios.patch).toHaveBeenCalledWith(
      `${api}task/1`,
      { done: true },
      {
        headers: { Authorization: 'Bearer mock-token' },
      }
    );
  });

  it('deve deletar uma tarefa', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.press(screen.getAllByText('Apagar')[0]);
    });

    expect(axios.delete).toHaveBeenCalledWith(`${api}task/1`, {
      headers: { Authorization: 'Bearer mock-token' },
    });
  });

  it('deve mostrar estado vazio quando não houver tarefas', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: [] });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nenhuma tarefa encontrada')).toBeTruthy();
      expect(
        screen.getByText('Toque no botão "+" para adicionar uma nova tarefa')
      ).toBeTruthy();
    });
  });

  it('deve fazer logout corretamente', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.press(screen.getByText('Sair'));
    });

    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  it('deve lidar com erro 401 (não autorizado)', async () => {
    const error = new Error('Não autorizado');
    (axios.get as jest.Mock).mockRejectedValue({
      ...error,
      response: { status: 401 },
      isAxiosError: true,
    });
    
    renderComponent();

    await waitFor(() => {
      expect(mockAuthContext.logout).toHaveBeenCalled();
    });
  });
});