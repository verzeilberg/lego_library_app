import React, {useEffect, useState} from 'react';
import {View, TextInput, Button, Text, Pressable, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {handleGeneratePassword, togglePasswordVisibility, checkPassword} from '../../utils/passwordUtils';
import {handleSubmitRegistration} from '../../components/Apicalls'
import {useStyles} from '../../styles';
import ErrorBanner from '../../components/ui/ErrorBanner';

export default function RegistrationScreen({navigation, setGlobalError, setGlobalLoading}) {
    const styles = useStyles();
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSecure, setIsSecure] = useState(true);

    useEffect(() => {
        setGlobalLoading(false);
    }, []);

    return (
        <View style={styles.flex1}>
            <ErrorBanner />
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
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />
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
            <View style={[styles.input, styles.inputContainer]}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="Confirm Password"
                    secureTextEntry={isSecure}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility(isSecure, setIsSecure)}
                                  style={styles.icon}>
                    <Icon name={isSecure ? 'eye-slash' : 'eye'} size={20} color="#000"/>
                </TouchableOpacity>

            </View>

            {/* Button to trigger password generation */}
            <View style={styles.buttonContainer}>
                <Button title="Generate Password" onPress={() => handleGeneratePassword(setPassword)}/>
            </View>
            <Pressable
                style={styles.button}
                onPress={() => {
                    const doPasswordMatch = checkPassword(password, confirmPassword, setGlobalError);
                    if (doPasswordMatch) {
                        setGlobalLoading(true);
                        handleSubmitRegistration(firstname, lastname, email, password, setGlobalError, setGlobalLoading, navigation);
                    }

                }}
            >
                <Text style={[styles.text, {color: '#fff'}]}>Register</Text>
            </Pressable>
            </View>
        </View>
    );
};

