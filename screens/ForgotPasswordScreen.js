import React, {useState} from 'react';
import {View, TextInput, Text, Pressable} from 'react-native';
import {globalStyles} from "../styles";
import {handleForgotPasswordSubmit} from "../components/Apicalls";

const ForgotPasswordScreen = ({navigation, setGlobalError, setGlobalLoading}) => {
    const [email, setEmail] = useState('');
    const handlePress = () => {
        setGlobalLoading(true);
        handleForgotPasswordSubmit(email, setGlobalError, setGlobalLoading, navigation);
    };

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
            <Pressable
                style={globalStyles.button}
                onPress={handlePress}
            >
                <Text style={globalStyles.text}>Reset password</Text>
            </Pressable>
        </View>
    );

};

export default ForgotPasswordScreen;
