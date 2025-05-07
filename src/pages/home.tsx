import React, { useEffect, useState, useContext } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/user-context"; 
import Constants from 'expo-constants';
import { api } from "../api";

type Task = {
  id: number;
  title: string;
  description: string;
  done: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export function HomeScreen({ navigation }: { navigation: any }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: ''
  });
  
  const authContext = useContext(AuthContext);
  const { user, token, logout } = authContext;

  const fetchTasks = async () => {
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${api}task`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Tasks fetched:", response.data);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch tasks");
      console.error("Error fetching tasks:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        Alert.alert("Session Expired", "Please login again");
        logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert("Error", "Task title is required");
      return;
    }

    try {
      const response = await axios.post(
        `${api}task`,
        {
          title: newTask.title,
          description: newTask.description
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks([...tasks, response.data]);
      setModalVisible(false);
      setNewTask({ title: '', description: '' });
    } catch (err) {
      console.error("Error adding task:", err);
      Alert.alert("Error", "Failed to add task");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await axios.delete(`${api}task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setTasks(tasks.filter(task => task.id !== taskId));
      Alert.alert("Sucesso", "Tarefa removida com sucesso");
    } catch (err) {
      console.error("Error deleting task:", err);
      Alert.alert("Erro", "Não foi possível remover a tarefa");
    }
  };

  const handleToggleTaskStatus = async (taskId: number) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;
      
      const response = await axios.patch(
        `${api}task/${taskId}`,
        { done: !taskToUpdate.done },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setTasks(tasks.map(task => 
        task.id === taskId ? response.data : task
      ));
    } catch (err) {
      console.error("Error updating task:", err);
      Alert.alert("Erro", "Não foi possível atualizar a tarefa");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={[
      styles.taskItem, 
      item.done && styles.taskItemCompleted
    ]}>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.taskStatusContainer}>
          <Text style={styles.taskStatus}>
            {item.done ? "✅ Completa" : "🟡 Pendente"}
          </Text>
          <Text style={styles.taskDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.taskActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleToggleTaskStatus(item.id)}
        >
          <Text style={styles.actionButtonText}>
            {item.done ? "Desfazer" : "Concluir"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTask(item.id)}
        >
          <Text style={styles.actionButtonText}>Apagar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchTasks}>
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bem vindo(a), {user?.name}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007BFF"]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.noTasksText}>Sem tarefas! Cadastre novas</Text>
        }
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ADICIONAR NOVA TAREFA</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Titulo da Tarefa"
              value={newTask.title}
              onChangeText={(text) => setNewTask({...newTask, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Descricao da Tarefa (opcional)"
              multiline
              numberOfLines={4}
              value={newTask.description}
              onChangeText={(text) => setNewTask({...newTask, description: text})}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewTask({ title: '', description: '' });
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButtonModal]}
                onPress={handleAddTask}
              >
                <Text style={styles.modalButtonText}>Adicionar Tarefa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#F5FCFF",
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskItemCompleted: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  taskStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  taskStatus: {
    fontSize: 14,
    color: "#007BFF",
  },
  taskDate: {
    fontSize: 12,
    color: "#999",
  },
  taskActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
    alignItems: 'center',
    minWidth: 80,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  noTasksText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginVertical: 20,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 69,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  addButtonModal: {
    backgroundColor: '#007BFF',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});