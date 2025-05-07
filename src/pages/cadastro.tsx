import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { api } from '../api';
import Constants from "expo-constants";
export function CadastroScreen({ navigation }: { navigation: any }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // Basic validation
        if (!formData.name || !formData.email || !formData.password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (formData.password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch(`${api}user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
                navigation.goBack(); 
            } else {
                Alert.alert('Erro', data.message || 'Erro ao cadastrar');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Erro', 'Não foi possível conectar ao servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* <Image 
                    source={require('../assets/logo.png')} 
                    style={styles.logo}
                /> */}
                
                <Text style={styles.title}>CADASTRO</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nome:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu nome"
                        value={formData.name}
                        onChangeText={(text) => setFormData({...formData, name: text})}
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={(text) => setFormData({...formData, email: text})}
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Senha:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        secureTextEntry
                        value={formData.password}
                        onChangeText={(text) => setFormData({...formData, password: text})}
                    />
                </View>
                
                <TouchableOpacity 
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#2596be" />
                    ) : (
                        <Text style={styles.registerButtonText}>CADASTRAR</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.loginLink}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.loginLinkText}>Já tem uma conta? Faça login</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2596be',
        paddingTop: Constants.statusBarHeight,
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 40,
    },
    logo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderColor: '#2596be',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    registerButtonText: {
        color: '#2596be',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginLinkText: {
        color: '#fff',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});