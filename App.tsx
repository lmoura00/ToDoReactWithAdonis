import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/user-context";
import { Routes } from "./src/routes";

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Routes />
    </AuthProvider>
  );
}
