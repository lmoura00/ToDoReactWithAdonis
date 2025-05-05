import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native"

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <TouchableOpacity
        
        style={styles.button}
      >
        <Text style={styles.buttonText}>Go to Details</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
    padding: 10,
    borderRadius: 5,
    width: 200,
    alignItems: "center",
  },
  buttonTextDisabled: {
    color: "#666666",
    fontSize: 18,
    fontWeight: "bold",
  },
});