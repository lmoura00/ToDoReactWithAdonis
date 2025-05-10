import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";

type AddTaskModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  task: {
    title: string;
    description: string;
  };
  onTaskChange: (field: string, value: string) => void;
};

export const AddTaskModal = ({
  visible,
  onClose,
  onSubmit,
  task,
  onTaskChange,
}: AddTaskModalProps) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.modalContainer}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>ADICIONAR NOVA TAREFA</Text>

        <TextInput
          testID="task-title-input"
          style={styles.input}
          placeholder="Título da Tarefa"
          value={task.title}
          placeholderTextColor={"#2596be"}
          onChangeText={(text) => onTaskChange("title", text)}
        />

        <TextInput
          testID="task-description-input"
          style={[styles.input, styles.descriptionInput]}
          placeholder="Descrição da Tarefa"
          multiline
          placeholderTextColor={"#2596be"}
          numberOfLines={4}
          value={task.description}
          onChangeText={(text) => onTaskChange("description", text)}
        />

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, styles.addButtonModal]}
            onPress={onSubmit}
          >
            <Text style={styles.modalButtonText}>Adicionar Tarefa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
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
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2596be",
  },
  input: {
    borderWidth: 1,
    borderColor: "#2596be",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  descriptionInput: {
    height: 100,
    color: "#2596be",
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  addButtonModal: {
    backgroundColor: "#2596be",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
