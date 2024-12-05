import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet, Text, Pressable, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Config from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegistrationScreen({route, navigation}) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSecure, setIsSecure] = useState(true);
    const { userId } = route.params;
    const togglePasswordVisibility = () => {
        setIsSecure(!isSecure);
    };

    const toggleSwitch = () => setIsSecure(previousState => !previousState);

    // Function to generate a strong password
    const generatePassword = (length = 12) => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?';
        let newPassword = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            newPassword += chars[randomIndex];
        }
        return newPassword;
    };

    // Handle password generation on button press
    const handleGeneratePassword = () => {
        const generatedPassword = generatePassword(16); // Suggest 16 character password
        setPassword(generatedPassword)
        setConfirmPassword(generatedPassword);
    };

    const checkPassword = () => {
        if (password === confirmPassword && password.length > 0) {
            setError('Passwords match!');
        } else {
            setError('Passwords do not match!');
        }
    };

    const handleCodeSubmit = async (password) => {
        // API endpoint for registration
        const apiUrl = Config.API_BASE_URL+'/api/users/'+userId;

        // Sending json data
        const data = {
            plainPassword: password
        };

        const token = await AsyncStorage.getItem('token');

        try {
            fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ${token}',
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => {
                   console.log(result);

                })
                .catch(error => {
                    console.error('Error saving:', error);
                });

        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.input, styles.inputContainer]}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="Enter Password"
                    secureTextEntry={isSecure}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
                    <Icon name={isSecure ? 'eye-slash' : 'eye'} size={20} color="#000"/>
                </TouchableOpacity>
            </View>
            <View style={[styles.input, styles.inputContainer]}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="Confirm Password"
                    secureTextEntry={isSecure}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
                    <Icon name={isSecure ? 'eye-slash' : 'eye'} size={20} color="#000"/>
                </TouchableOpacity>

            </View>

            {/* Button to trigger password generation */}
            <View style={styles.buttonContainer}>
                <Button title="Generate Password" onPress={handleGeneratePassword}/>
            </View>

            {/* Conditionally render error message */}
            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                style={styles.button}
                onPress={() => handleCodeSubmit(password)}
            >
                <Text style={styles.text}>Save</Text>
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
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        elevation: 3,
        marginTop: 10,
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    text: {
        fontSize: 16,
        lineHeight: 18,
        fontWeight: 'bold',
        letterSpacing: 0.50,
        color: 'white',
    },
    buttonContainer: {
        width: '80%',
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
        width: '80%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
});

