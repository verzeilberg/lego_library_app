import {TextInput, View, Text, Pressable, TouchableOpacity} from "react-native";
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { globalStyles } from '../styles';
import { checkToken, togglePasswordVisibility } from '../components/Functions';
import { handleSubmitLogin } from '../components/Apicalls'
import LoadingSpinner from '../components/Elements';

export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSecure, setIsSecure] = useState(true);

    /** Check token when the page is loaded **/
    useEffect(() => {
        checkToken(navigation, setErrorMessage, setLoading);
    }, []);

    //If loading show spinner
    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.paragraph.right}>Please login to get acces to your account!</Text>

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

            {/* Conditionally render error message */}
            {errorMessage && (
                <Text style={globalStyles.errorText}>{errorMessage}</Text>
            )}
            <Pressable
                style={globalStyles.button}
                onPress={() => handleSubmitLogin(email, password, navigation, setErrorMessage)}
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
