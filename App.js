import React, {useEffect, useState} from 'react';
import {Button, View, ActivityIndicator, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import ProfileScreen from './screens/ProfileScreen';
import LogoutScreen from './screens/LogoutScreen';

const Stack = createNativeStackNavigator();

function App() {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Function to check for token
    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (token) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Error checking token', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkToken();
    }, []);

    if (loading) {
        // Show loading spinner while checking token
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Login" component={LoginScreen}/>
                <Stack.Screen name="Profile" component={ProfileScreen}/>
                <Stack.Screen name="Registration" component={RegistrationScreen}/>
                <Stack.Screen name="Logout" component={LogoutScreen}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
