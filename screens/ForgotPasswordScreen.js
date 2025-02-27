import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet, Text, Pressable} from 'react-native';
import {globalStyles} from "../styles";
import {handleForgotPasswordSubmit} from "../components/Apicalls";

const ForgotPasswordScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.paragraph}>Please fill in your email address to get a code to change your password. </Text>
            <TextInput
                style={globalStyles.input}
                autoFocus={true}
                placeholder="Enter email"
                onChangeText={text => setEmail(text)}
                value={email}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {/* Conditionally render error message */}
            {errorMessage && (
                <Text style={globalStyles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                style={globalStyles.button}
                onPress={() => handleForgotPasswordSubmit(email, setErrorMessage, navigation)}
            >
                <Text style={globalStyles.text}>Reset password</Text>
            </Pressable>
        </View>
    );

};

export default ForgotPasswordScreen;
