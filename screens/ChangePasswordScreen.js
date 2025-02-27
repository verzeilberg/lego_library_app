import React, {useState} from 'react';
import {View, TextInput, Button, Text, Pressable, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {checkPassword, handleGeneratePassword, togglePasswordVisibility} from "../components/Functions";
import {handlePasswordSubmit} from "../components/Apicalls";
import {globalStyles} from "../styles";

export default function ChangePasswordScreen({route, navigation}) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSecure, setIsSecure] = useState(true);

    return (
        <View style={globalStyles.container}>
            <View style={[globalStyles.input, globalStyles.inputContainer]}>
                <TextInput
                    style={globalStyles.inputPassword}
                    placeholder="Enter Password"
                    secureTextEntry={isSecure}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility(isSecure, setIsSecure)}style={globalStyles.icon}>
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
                        handlePasswordSubmit(password, navigation)
                    }
                }}
            >
                <Text style={globalStyles.text}>Save</Text>
            </Pressable>
        </View>
    );
};
