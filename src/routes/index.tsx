import { NavigationContainer } from '@react-navigation/native';
import { AuthRoutes } from './auth-routes';
import { PublicRoutes } from './public-routes';
import { useAuth } from '../hooks/use-user';
import  { useEffect, useState } from 'react';
import React = require('react');

export function Routes() {
    const { token } = useAuth();

    return (
        <NavigationContainer>
            {token ? <AuthRoutes /> : <PublicRoutes />}
        </NavigationContainer>
    );
}