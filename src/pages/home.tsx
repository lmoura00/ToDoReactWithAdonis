import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  TextInput,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/user-context";
import Constants from "expo-constants";
import { api } from "../api";
import { TaskItem } from "../componentes/TaskItem";
import { AddTaskModal } from "../componentes/AddTaskModal";
import LottieView from "lottie-react-native";

type Task = {
  id: number;
  title: string;
  description: string;
  done: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type FilterType = "all" | "completed" | "pending";

export function HomeScreen({ navigation }: { navigation: any }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  const authContext = useContext(AuthContext);
  const { user, token, logout } = authContext;

  const fetchTasks = useCallback(async () => {
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
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError("Falha ao carregar tarefas");
      console.error("Error fetching tasks:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        Alert.alert("Sessão expirada", "Por favor, faça login novamente");
        logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    let result = tasks;

    if (filter === "completed") {
      result = result.filter((task) => task.done);
    } else if (filter === "pending") {
      result = result.filter((task) => !task.done);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(result);
  }, [tasks, filter, searchQuery]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert("Erro", "Título não pode estar em branco!");
      return;
    }

    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || "",
      };

      const response = await axios.post(`${api}task`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks([...tasks, response.data]);
      setModalVisible(false);
      setNewTask({ title: "", description: "" });
      fetchTasks();
    } catch (err) {
      console.error("Erro adicionando tarefa:", err);
      Alert.alert("Erro", "Falha ao adicionar tarefa");
      if (axios.isAxiosError(err)) {
        console.error("Server response:", err.response?.data);
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await axios.delete(`${api}task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Erro ao remover:", err);
      Alert.alert("Erro", "Não foi possível remover a tarefa");
    }
  };

  const handleToggleTaskStatus = async (taskId: number) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      );
      setTasks(updatedTasks);

      await axios.patch(
        `${api}task/${taskId}`,
        { done: !tasks.find((task) => task.id === taskId)?.done },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      setTasks(tasks);
      Alert.alert("Erro", "Não foi possível atualizar a tarefa");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TaskItem
      item={item}
      onToggleStatus={handleToggleTaskStatus}
      onDelete={handleDeleteTask}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <LottieView
        autoPlay
        style={{
          width: 400,
          height: 400,
        }}
        source={require("../../assets/empty.json")}
      />
      <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
      <Text style={styles.emptySubText}>
        {filter !== "all" || searchQuery
          ? "Tente ajustar seus filtros de busca"
          : 'Toque no botão "+" para adicionar uma nova tarefa'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          testID="loading-indicator"
          size="large"
          color="#2596be"
        />
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
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
        <TouchableOpacity
          onPress={logout}
          style={{ position: "absolute", right: 30, top: 90 }}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header1}>
        <Text style={styles.title}>Bem vindo(a), {user?.name}</Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "all" && styles.activeFilter,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "all" && styles.activeFilterText,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "pending" && styles.activeFilter,
            ]}
            onPress={() => setFilter("pending")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "pending" && styles.activeFilterText,
              ]}
            >
              Pendentes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "completed" && styles.activeFilter,
            ]}
            onPress={() => setFilter("completed")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "completed" && styles.activeFilterText,
              ]}
            >
              Concluídas
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tarefas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item?.id?.toString() || Math.random().toString()
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2596be"]}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />

      <TouchableOpacity
        testID="add-task-button"
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setNewTask({ title: "", description: "" });
        }}
        onSubmit={handleAddTask}
        task={newTask}
        onTaskChange={(field, value) =>
          setNewTask({ ...newTask, [field]: value })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#2596be",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    width: "100%",
    height: 150,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginTop: -60,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: -40,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#2596be",
    padding: 5,
    backgroundColor: "#2596be",
  },
  header1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 18,
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  activeFilter: {
    backgroundColor: "#fff",
  },
  filterButtonText: {
    color: "#555",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#2596be",
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 150,
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2596be",
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
  addButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
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
    color: "#2596be",
    fontSize: 30,
    fontWeight: "bold",
  },
});
