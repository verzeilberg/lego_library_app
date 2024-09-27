import {TextInput, View, StyleSheet, Text, ActivityIndicator, Pressable} from "react-native";
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    /**
     * An asynchronous function to check for the existence of a token in AsyncStorage.
     * If a token is found, it clears any current error message, removes the token from AsyncStorage,
     * and navigates to the 'Profile' screen. If an error occurs, it will log the error to the console.
     * After the process completes, it will set the loading state to false.
     *
     * @returns {Promise<void>} A promise that resolves when the token check and any subsequent actions are complete.
     */
    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                setErrorMessage(null);
                navigation.navigate('Profile');
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

    /**
     * Load spinner while loading
     */
    if (loading) {
        // Show loading spinner while checking token
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    /**
     * Submits the user's email and password to the authentication API.
     *
     * @param {string} email - The user's email address.
     * @param {string} password - The user's password.
     */
    const handleSubmit = (email, password) => {
        // Assuming platformAPI is your API endpoint (ip is ip4 from internet connection (wifi or cable), you can not use a server with a port like 8080)
        const apiUrl = 'http://10.1.1.118/auth';
        setErrorMessage(null);

        // Assuming your API expects JSON data
        const data = {
            email: email,
            password: password
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
                    // Handle result from API, e.g., display success message, navigate to log in screen, etc.
                    const token = result.token;
                    if (token) {
                        AsyncStorage.setItem('token', token);
                        navigation.navigate('Profile');
                    } else {
                        setErrorMessage('Login unsuccesfull: '+result.message);
                    }
                })
                .catch(error => {
                    setErrorMessage('Error login: '+error.message);
                });
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                autoFocus={true}
                placeholder="Email"
                onChangeText={text => setEmail(text)}
                value={email}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={text => setPassword(text)}
                value={password}
                secureTextEntry
            />
            {/* Conditionally render error message */}
            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                style={styles.button}
                onPress={() => handleSubmit(email, password)}
            >
                <Text style={styles.text}>Login</Text>
            </Pressable>
            <Pressable
                style={styles.button}
                onPress={() => navigation.navigate('Registration')}
            >
                <Text style={styles.text}>Registration</Text>
            </Pressable>
        </View>
    );


};

const styles = StyleSheet.create({
    container: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: 'red',
        width: '80%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        marginTop:10,
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    text: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: 'bold',
        letterSpacing: 0.50,
        color: 'white',
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
    },
});
