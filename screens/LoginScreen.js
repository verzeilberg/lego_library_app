import {TextInput, View, Text, Pressable, TouchableOpacity, Image, KeyboardAvoidingView, Platform} from "react-native";
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {globalStyles} from '../styles';
import {checkToken, togglePasswordVisibility} from '../components/Functions';
import {handleSubmitLogin} from '../components/Apicalls'

export default function LoginScreen({navigation, setGlobalError, setGlobalLoading}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSecure, setIsSecure] = useState(true);

    /** Check token when the page is loaded **/
    useEffect(() => {
        setGlobalLoading(true);
        checkToken(navigation, setGlobalError, setGlobalLoading);
    }, []);

    return (
        <KeyboardAvoidingView
            style={globalStyles.containerKeyboard}
            behavior={Platform.OS === "ios" ? "padding" : "height"} // "padding" is best for iOS
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // adjust for headers/navbars
        >
            <View style={globalStyles.container}>
                <Image
                    style={globalStyles.stretch}
                    source={require('../assets/images/lego_logo.png')}
                />

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
                    autoCorrect={false}
                />
                <View style={[globalStyles.input, globalStyles.inputContainer]}>
                    <TextInput
                        style={globalStyles.inputPassword}
                        placeholder="Enter Password"
                        secureTextEntry={isSecure}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => togglePasswordVisibility(isSecure, setIsSecure)}
                                      style={globalStyles.icon}>
                        <Icon name={isSecure ? 'eye-slash' : 'eye'} size={20} color="#000"/>
                    </TouchableOpacity>
                </View>

                <Pressable
                    style={globalStyles.button}
                    onPress={() => handleSubmitLogin(email, password, navigation, setGlobalError)}
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
        </KeyboardAvoidingView>
    );
};
