import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


type TaskItemProps = {
  item: Task;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
};

export const TaskItem = React.memo(({ item, onToggleStatus, onDelete }: TaskItemProps) => (
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
      </View>
    </View>
    
    <View style={styles.taskActions}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.completeButton]}
        onPress={() => onToggleStatus(item.id)}
      >
        <Text style={styles.actionButtonText}>
          {item.done ? "Desfazer" : "Concluir"}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => onDelete(item.id)}
      >
        <Text style={styles.actionButtonText}>Apagar</Text>
      </TouchableOpacity>
    </View>
  </View>
));

const styles = StyleSheet.create({
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
    borderLeftColor: "rgb(43, 188, 240)",
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
    color: "#2596be",
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
});