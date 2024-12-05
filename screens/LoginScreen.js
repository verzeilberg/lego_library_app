import {TextInput, View, StyleSheet, Text, ActivityIndicator, Pressable, TouchableOpacity, Linking} from "react-native";
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Config from '../config/config';
import { globalStyles } from '../styles';
/** import {checkToken} from '../components/Functions'; **/

export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSecure, setIsSecure] = useState(true);
    const togglePasswordVisibility = () => {
        setIsSecure(!isSecure);
    };

    const toggleSwitch = () => setIsSecure(previousState => !previousState);

    /**
     * An asynchronous function to check for the existence of a token in AsyncStorage.
     * If a token is found, it clears any current error message, removes the token from AsyncStorage,
     * and navigates to the 'Profile' screen. If an error occurs, it will log the error to the console.
     * After the process completes, it will set the loading state to false.
     *
     * @returns {Promise<void>} A promise that resolves when the token check and any subsequent actions are complete.
     **/
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
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#0000ff"/>
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
        const apiUrl = Config.API_BASE_URL+'/api/login';
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
                    console.log('Token from login: \n');
                    console.log(token);
                    AsyncStorage.setItem('token', token);
                    navigation.navigate('Profile');
                } else {
                    setErrorMessage('Login unsuccesfull: ' + result.error);
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
            <View style={[globalStyles.input, globalStyles.inputContainer]}>
                <TextInput
                    style={globalStyles.inputPassword}
                    placeholder="Enter Password"
                    secureTextEntry={isSecure}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={globalStyles.icon}>
                    <Icon name={isSecure ? 'eye-slash' : 'eye'} size={20} color="#000"/>
                </TouchableOpacity>
            </View>

            {/* Conditionally render error message */}
            {errorMessage && (
                <Text style={globalStyles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                style={globalStyles.button}
                onPress={() => handleSubmit(email, password)}
            >
                <Text style={globalStyles.text}>Login</Text>
            </Pressable>

            <View style={globalStyles.row}>
                <Pressable
                    style={globalStyles.linking}
                    onPress={() => navigation.navigate('Registration')}
                >
                    <Text style={globalStyles.link}>Registration</Text>
                </Pressable>
                <Text> | </Text>
                <Pressable
                    style={globalStyles.linking}
                    onPress={() => navigation.navigate('ForgotPassword')}
                >
                    <Text style={globalStyles.link}>Forgot password</Text>
                </Pressable>
            </View>

        </View>
    );


};
