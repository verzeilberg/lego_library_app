import React, {useEffect, useState} from 'react';
import {View, TextInput, Button, StyleSheet, Text, Pressable, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { handleGeneratePassword, togglePasswordVisibility, checkPassword } from '../components/Functions';
import {handleSubmitRegistration} from '../components/Apicalls'
import LoadingSpinner from '../components/Elements';
import { globalStyles } from '../styles';

export default function RegistrationScreen({navigation}) {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSecure, setIsSecure] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={globalStyles.container}>
            <TextInput
                style={globalStyles.input}
                placeholder="Firstname"
                onChangeText={text => setFirstname(text)}
                value={firstname}
            />
            <TextInput
                style={globalStyles.input}
                placeholder="Lastname"
                onChangeText={text => setLastname(text)}
                value={lastname}
            />
            <TextInput
                style={globalStyles.input}
                placeholder="Email"
                type="email"
                onChangeText={text => setEmail(text)}
                value={email}
                keyboardType="email-address"
            />
            <View style={[globalStyles.input, globalStyles.inputContainer]}>
                <TextInput
                    style={globalStyles.inputPassword}
                    placeholder="Enter Password"
                    secureTextEntry={isSecure}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility(isSecure, setIsSecure)} style={globalStyles.icon}>
                    <Icon name={isSecure ? 'eye-slash' : 'eye'} size={20} color="#000"/>
                </TouchableOpacity>
            </View>
            <View style={[globalStyles.input, globalStyles.inputContainer]}>
                <TextInput
                    style={globalStyles.inputPassword}
                    placeholder="Confirm Password"
                    secureTextEntry={isSecure}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility(isSecure, setIsSecure)}style={globalStyles.icon}>
                    <Icon name={isSecure ? 'eye-slash' : 'eye'} size={20} color="#000"/>
                </TouchableOpacity>

            </View>

            {/* Button to trigger password generation */}
            <View style={globalStyles.buttonContainer}>
                <Button title="Generate Password" onPress={() => handleGeneratePassword(setPassword)}/>
            </View>

            {/* Conditionally render error message */}
            {errorMessage && (
                <Text style={globalStyles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                style={globalStyles.button}
                onPress={() => {
                    const doPasswordMatch = checkPassword(password, confirmPassword, setErrorMessage);
                    if (doPasswordMatch) {
                        handleSubmitRegistration(firstname, lastname, email, password, setErrorMessage, navigation);
                    }

            }}
            >
                <Text style={globalStyles.text}>Register</Text>
            </Pressable>
        </View>
    );
};

