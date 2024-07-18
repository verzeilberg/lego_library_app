import {Button, TextInput, View, StyleSheet, Text} from "react-native";
import React, {useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default function LoginScreen({navigation}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (username, password) => {
        // Assuming platformAPI is your API endpoint
        const apiUrl = 'http://192.168.2.31/auth';

        // Assuming your API expects JSON data
        const data = {
            email: username,
            password: password
        };


        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if required
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                // Handle result from API, e.g., display success message, navigate to login screen, etc.
                console.log('Registration successful', result);
            })
            .catch(error => {
                console.error('Error registering:', error);
            });
    };





    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Username"
                onChangeText={text => setUsername(text)}
                value={username}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={text => setPassword(text)}
                value={password}
                secureTextEntry
            />
            <Button
                title="Login"
                onPress={() => handleSubmit(username, password)}
            />
            <Button
                title="Registration"
                onPress={() => navigation.navigate('Registration')}
            />
        </View>
    );


};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});
