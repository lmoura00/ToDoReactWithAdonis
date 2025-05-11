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
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

const colors = {
  primary: "#2596be",
  secondary: "#1c7d9a",
  accent: "#FF3B30",
  background: "#f8f9fa",
  text: "#333",
  lightText: "#777",
};

export function HomeScreen({ navigation }: { navigation: any }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
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
      setDeleteModalVisible(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Erro ao remover:", err);
      Alert.alert("Erro", "Não foi possível remover a tarefa");
      setDeleteModalVisible(false);
      setTaskToDelete(null);
    }
  };

  const confirmDelete = (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteModalVisible(true);
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
      onDelete={confirmDelete}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <LottieView
        autoPlay
        style={{
          marginTop: -150,
          width: 500,
          height:500,
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
      <View style={styles.container}>
        <StatusBar style="light" />
        {[...Array(5)].map((_, i) => (
          <View key={i} style={styles.skeletonItem}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: "70%" }]} />
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={fetchTasks}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
        <Text style={styles.logoText}>ANY DO</Text>
        <TouchableOpacity
          onPress={logout}
          style={styles.logoutButton}
          activeOpacity={0.7}
        >
          <Ionicons name="exit-outline" size={24} color={colors.accent} />
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
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="done-all"
              size={18}
              color={filter === "all" ? colors.primary : colors.lightText}
            />
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
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="pending-actions"
              size={18}
              color={filter === "pending" ? colors.primary : colors.lightText}
            />
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
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="check-circle"
              size={18}
              color={filter === "completed" ? colors.primary : colors.lightText}
            />
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

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.lightText}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tarefas..."
            placeholderTextColor={colors.lightText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
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
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />

 
      <TouchableOpacity
        testID="add-task-button"
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
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


      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => {
          setDeleteModalVisible(false);
          setTaskToDelete(null);
        }}
      >
        <View style={styles.centeredModalView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja excluir esta tarefa?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setTaskToDelete(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => taskToDelete && handleDeleteTask(taskToDelete)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#2596be",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    marginTop: -50,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    height: 150,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#2596be",
    backgroundColor: "#2596be",
  },
  logoText: {
    fontSize: 29,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#2596be",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  header1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 5,
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 5,
  },
  activeFilter: {
    backgroundColor: "#fff",
  },
  filterButtonText: {
    color: "#555",
    fontWeight: "600",
    marginLeft: 5,
  },
  activeFilterText: {
    color: "#2596be",
  },
  searchContainer: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 15,
    top: 15,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    paddingLeft: 45,
    borderRadius: 25,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listContainer: {
    paddingBottom: 150,
    paddingHorizontal: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
    marginTop: -50,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 16,
    color: "#b9b9b9",
    textAlign: "center",
  },
  // Botões
  button: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 16,
    width: "60%",
  },
  buttonText: {
    color: "#2596be",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  // Botão de Adicionar
  addButton: {
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 90,
    right: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#2596be",
  },
  addButtonText: {
    color: "#2596be",
    fontSize: 30,
    fontWeight: "bold",
  },
  // Modal de Confirmação
  centeredModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#FF3B30",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  // Skeleton Loading
  skeletonItem: {
    backgroundColor: "#e1e1e1",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  skeletonLine: {
    backgroundColor: "#f0f0f0",
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: "100%",
  },
});