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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/use-user';
import axios from 'axios';

export function LoginScreen({ navigation }: { navigation: any }) {
    const [email, setEmail] = useState('user1@example.com');
    const [password, setPassword] = useState('123456');
    const { login, isLoading, error, token } = useAuth();

    const handleLogin = async () => {
        try {
            await login(email, password);
        } catch (error) {
            console.error('Login error in component:', error);
        }
    };

    useEffect(() => {
        console.log('Token updated in Login component:', token);
    }, [token]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <LinearGradient
                colors={['#2596be', '#1c7d9a']}
                style={styles.container}
            >
                <View style={styles.innerContainer}>
                    <Image 
                        source={require("../../assets/logo.png")} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>ANY-DO</Text>
                    
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#fff" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                    
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.loadingText}>Autenticando...</Text>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={styles.loginButton}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.buttonText}>Entrar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.registerButton}
                                onPress={() => navigation.navigate('Cadastro')}
                                disabled={isLoading}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.registerButtonText}>Criar nova conta</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    
                    {error && <Text style={styles.error}>{error}</Text>}
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
    },
    logo: {
        width: 120,
        height: 120,
        alignSelf: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        marginBottom: 40,
        textAlign: 'center',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    inputContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    inputIcon: {
        position: 'absolute',
        left: 20,
        top: 18,
        zIndex: 1,
    },
    input: {
        height: 56,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        fontSize: 16,
        color: '#fff',
        paddingLeft: 50,
    },
    loginButton: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    registerButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonText: {
        color: '#2596be',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    error: {
        color: '#FF6B6B',
        marginTop: 15,
        textAlign: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 14,
    },
});