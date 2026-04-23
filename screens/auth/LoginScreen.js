import {TextInput, View, Text, Pressable, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView, Platform, Linking} from "react-native";
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {globalStyles} from '../../styles';
import {togglePasswordVisibility} from '../../utils/passwordUtils';
import {handleSubmitLogin} from '../../components/Apicalls';
import {registerForPushNotifications} from '../../utils/notificationUtils';
import Config from "../../config/config";

export default function LoginScreen({navigation, setGlobalError, setGlobalLoading}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSecure, setIsSecure] = useState(true);

    const openApi = () => {
        Linking.openURL(Config.API_BASE_URL);
    };

    return (
        <KeyboardAvoidingView
            style={globalStyles.containerKeyboard}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <ScrollView
                contentContainerStyle={[globalStyles.container, { paddingTop: 80, paddingBottom: 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                <Image
                    style={globalStyles.stretch}
                    source={require('../../assets/images/lego_logo.png')}
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
                    onPress={async () => {
                        await handleSubmitLogin(email, password, navigation, setGlobalError);
                        registerForPushNotifications();
                    }}
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
                <Text>For more information, visit our website</Text>
                <Pressable onPress={openApi}>
                    <Text style={{ color: "blue", textDecorationLine: "underline" }}>
                        verzeilberg.nl
                    </Text>
                </Pressable>
                <Text>Version {Config.VERSION}</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
