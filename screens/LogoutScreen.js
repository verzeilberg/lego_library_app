import {Button, TextInput, View, StyleSheet, Text, ActivityIndicator} from "react-native";
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logout} from "../components/Apicalls";

export default function LogoutScreen({navigation}) {
    const [loading, setLoading] = useState(true);
    logout(false, navigation);

    if (loading) {
        // Show loading spinner while checking token
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

}
