import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet, Text, Pressable} from 'react-native';
import {globalStyles} from "../styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "../config/config";

const ForgotPasswordScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = (email) => {
        // Assuming platformAPI is your API endpoint (ip is ip4 from internet connection (wifi or cable), you can not use a server with a port like 8080)
        const apiUrl = Config.API_BASE_URL+'/api/public/user/forgot-password';
        setErrorMessage(null);
        // Assuming your API expects JSON data
        const data = {
            email: email
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                const token = result.token;
                if (token) {
                    AsyncStorage.setItem('reset-password-token', token);
                    navigation.navigate('ResetPassword');
                } else {
                    setErrorMessage(result.detail);
                }
            })
            .catch(error => {
                setErrorMessage('Error login: ' + error.message);
            });
    };

    return (
        <View style={globalStyles.container}>
            <TextInput
                style={globalStyles.input}
                autoFocus={true}
                placeholder="Enter email"
                onChangeText={text => setEmail(text)}
                value={email}
            />
            {/* Conditionally render error message */}
            {errorMessage && (
                <Text style={globalStyles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                style={globalStyles.button}
                onPress={() => handleSubmit(email)}
            >
                <Text style={globalStyles.text}>Reset password</Text>
            </Pressable>
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

export default ForgotPasswordScreen;
