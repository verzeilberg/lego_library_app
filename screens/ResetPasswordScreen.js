import React, {useState, useRef} from 'react';
import {View, TextInput, StyleSheet, Text, Pressable} from 'react-native';
import {globalStyles} from "../styles";
import Config from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FourDigitCodeInput({navigation}) {
    const [code, setCode] = useState(['', '', '', '']);
    const inputRefs = useRef([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showFirstContainer, setShowFirstContainer] = useState(true);

    // Toggle function to switch between containers
    const toggleContainer = () => {
        setShowFirstContainer(!showFirstContainer);
    };

    const handleCodeSubmit = async () => {
        // API endpoint for registration
        const url = Config.API_BASE_URL + '/api/public/user/check-forgot-password-code-token';
        const token = await AsyncStorage.getItem('reset-password-token');
        // Sending json data
        const params = {
            token: token,
            code: code.join(''),
        };

        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');

        const apiUrl = `${url}?${queryString}`;

        try {
            fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success && result.token) {
                        AsyncStorage.setItem('token', result.token)
                        navigation.navigate('ChangePassword', {
                            userId: result.userId
                        });
                    } else {
                        setErrorMessage(result.message);
                    }
                })
                .catch(error => {
                    setErrorMessage('Error checking token and code');
                    console.error('Error checking token and code:', error);
                });

        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    // Handle input change
    const handleChange = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;

        // Move to next input if the length of text is 1
        if (text.length === 1 && index < 3) {
            inputRefs.current[index + 1].focus();
        }
        setCode(newCode);
    };

    // Handle backspace to go to previous input
    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.paragraph}>Vul hieronder het 4-cijferige code in die u heeft ontvangen via de mail.</Text>
            <View style={globalStyles.row}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(input) => (inputRefs.current[index] = input)}
                        style={globalStyles.inputNumber}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="numeric"
                        maxLength={1}
                    />
                ))}
            </View>
            {/* Conditionally render error message */}
            {errorMessage && (
                <Text style={globalStyles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                style={globalStyles.button}
                onPress={() => handleCodeSubmit()}
            >
                <Text style={globalStyles.text}>Reset</Text>
            </Pressable>
        </View>
    );
};
