import {TextInput, View, Text, Pressable, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView, Platform, Linking} from "react-native";
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useStyles, useTheme} from '../../styles';
import {togglePasswordVisibility} from '../../utils/passwordUtils';
import {handleSubmitLogin} from '../../components/Apicalls';
import {registerForPushNotifications} from '../../utils/notificationUtils';
import Config from "../../config/config";
import ErrorBanner from "../../components/ui/ErrorBanner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({navigation, setGlobalError, setGlobalLoading}) {
    const styles = useStyles();
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSecure, setIsSecure] = useState(true);

    const isValidEmail = EMAIL_REGEX.test(email);
    const canLogin = isValidEmail && password.trim().length > 0;

    const openApi = () => {
        Linking.openURL(Config.API_BASE_URL);
    };

    return (
        <KeyboardAvoidingView
            style={styles.containerKeyboard}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <ErrorBanner />
            <ScrollView
                contentContainerStyle={[styles.container, { paddingTop: 10, paddingBottom: 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                <Image
                    style={styles.stretch}
                    source={require('../../assets/images/lego_logo.png')}
                />

                <Text style={[styles.paragraph, {textAlign: 'right'}]}>Please login to get acces to your account!</Text>

                <TextInput
                    style={[
                        styles.input,
                        email.length > 0 && !isValidEmail && {borderColor: 'red'},
                    ]}
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
                {email.length > 0 && !isValidEmail && (
                    <Text style={{color: 'red', marginTop: -5, marginBottom: 5}}>Invalid email address</Text>
                )}
                <View style={[styles.input, styles.inputContainer]}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Enter Password"
                        secureTextEntry={isSecure}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => togglePasswordVisibility(isSecure, setIsSecure)}
                                      style={styles.icon}>
                        <Icon name={isSecure ? 'eye-slash' : 'eye'} size={20} color="#000"/>
                    </TouchableOpacity>
                </View>

                <Pressable
                    style={({pressed}) => [
                        styles.button,
                        {backgroundColor: '#fe0000'},
                        pressed && {backgroundColor: '#cc0000'},
                        !canLogin && {backgroundColor: '#fe0000cc'},
                    ]}
                    disabled={!canLogin}
                    onPress={async () => {
                        await handleSubmitLogin(email, password, navigation, setGlobalError);
                        registerForPushNotifications();
                    }}
                >
                    <Text style={[styles.text, {color: colors.textLight}]}>Login</Text>
                </Pressable>

                <View style={styles.row}>
                    <Pressable
                        style={styles.linking}
                        onPress={() => navigation.navigate('Registration')}
                    >
                        <Text style={styles.link}>Registration</Text>
                    </Pressable>
                    <Text> | </Text>
                    <Pressable
                        style={styles.linking}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.link}>Forgot password</Text>
                    </Pressable>
                </View>
                <Text>For more information, visit our website</Text>
                <Pressable onPress={openApi}>
                    <Text style={{ color: colors.link, textDecorationLine: "underline" }}>
                        verzeilberg.nl
                    </Text>
                </Pressable>
                <Text>Version {Config.VERSION}</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
