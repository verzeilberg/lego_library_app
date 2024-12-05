import React, {useEffect, useState} from 'react';
import {View, TextInput, Button, StyleSheet, Text, Pressable, ActivityIndicator, TouchableOpacity} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/FontAwesome';
import Config from "../config/config";

export default function RegistrationScreen({navigation}) {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSecure, setIsSecure] = useState(true);
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
        setPassword(generatedPassword);
    };

    const checkPassword = () => {
        if (password === confirmPassword && password.length > 0) {
            setError('Passwords match!');
        } else {
            setError('Passwords do not match!');
        }
    };

    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                setErrorMessage(null);
                navigation.navigate('Profile');
            }
        } catch (error) {
            console.error('Error', error);
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

    const handleSubmit = (firstname, lastname, email, password) => {
        // API endpoint for registration
        const apiUrl = Config.API_BASE_URL+'/api/public/user/register';

        // Sending json data
        const data = {
            firstName: firstname,
            lastName: lastname,
            email: email,
            plainPassword: password
        };

        try {
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
                    console.log(result);
                    const message = result.detail;
                    if (message) {
                        console.log('Registration unsuccesfull', result);
                        setErrorMessage('Registration unsuccesfull: \n' + result.detail);
                    } else {
                        navigation.navigate('Login');
                    }
                })
                .catch(error => {

                    console.error('Error registering:', error);
                });

        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Firstname"
                onChangeText={text => setFirstname(text)}
                value={firstname}
            />
            <TextInput
                style={styles.input}
                placeholder="Lastname"
                onChangeText={text => setLastname(text)}
                value={lastname}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                type="email"
                onChangeText={text => setEmail(text)}
                value={email}
                keyboardType="email-address"
            />
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
                onPress={() => handleSubmit(firstname, lastname, email, password)}
            >
                <Text style={styles.text}>Register</Text>
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

