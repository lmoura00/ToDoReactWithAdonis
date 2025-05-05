import React from "react";
import {View, TextInput, TouchableOpacity, StyleSheet, Text } from "react-native";


export function CadastroScreen() {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
      />
      <TouchableOpacity
        onPress={() => alert("Cadastro realizado com sucesso!")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Cadastrar</Text>
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
  input: {
    height: 40,
    width: "80%",
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  }
});