import {Button, TextInput, View, StyleSheet, Text, ActivityIndicator} from "react-native";
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogoutScreen({navigation}) {
    const [loading, setLoading] = useState(true);
    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                AsyncStorage.removeItem('token')
                navigation.navigate('Login');
            } else {
                navigation.navigate('Login');
            }
        } catch (error) {
            console.error('Error logging out', error);
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

}
