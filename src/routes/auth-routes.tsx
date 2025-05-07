import React = require('react');
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { HomeScreen } from '../pages/home';




export function AuthRoutes() {
    const {Navigator, Screen} = createNativeStackNavigator();
    return (
        <Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Screen name="Home" component={HomeScreen} />
        </Navigator>
    );
}