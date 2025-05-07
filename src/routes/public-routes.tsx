import React = require('react');
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../pages/login';
import { CadastroScreen } from '../pages/cadastro';

export function PublicRoutes() {
    const { Navigator, Screen } = createNativeStackNavigator();
    return (
        <Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Screen name="Login" component={LoginScreen} />
            <Screen name="Cadastro" component={CadastroScreen} />
            
        </Navigator>
    );
}