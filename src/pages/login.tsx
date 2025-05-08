import React, { useEffect, useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useAuth } from '../hooks/use-user';
import axios from 'axios';

export function LoginScreen({ navigation }: { navigation: any }) {
    const [email, setEmail] = useState('user1@example.com');
    const [password, setPassword] = useState('123456');
    const { login, isLoading, error, token } = useAuth();

    const handleLogin = async () => {
        try {
            const result = await login(email, password);
            console.log('Login result:', result);
        } catch (error) {
            console.error('Login error in component:', error);
            Alert.alert("Erro", "Falha no login. Verifique suas credenciais.");
        }
    };

    useEffect(() => {
        console.log('Token updated in Login component:', token);
    }, [token]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.innerContainer}>
                <Image source={require("../../assets/logo.png")} style={styles.logo}/>
                <Text style={styles.title}>ANY-DO</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                ) : (
                    <>
                        <TouchableOpacity 
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>Entrar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.registerButton}
                            onPress={() => navigation.navigate('Cadastro')}
                            disabled={isLoading}
                        >
                            <Text style={styles.registerButtonText}>Criar nova conta</Text>
                        </TouchableOpacity>
                    </>
                )}
                
                {error && <Text style={styles.error}>{error}</Text>}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2596be',
    },
    logo:{
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: 20,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 90,
        textAlign: 'center',
        color: '#fff',
    },
    input: {
        height: 50,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    registerButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    buttonText: {
        color: '#2596be',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        marginTop: 15,
        textAlign: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
});