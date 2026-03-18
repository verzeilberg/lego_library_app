import React, {useEffect, useState} from 'react';
import {View, TextInput, Button, Text, Pressable, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {handleGeneratePassword, togglePasswordVisibility, checkPassword} from '../../utils/passwordUtils';
import {handleSubmitRegistration} from '../../components/Apicalls'
import {globalStyles} from '../../styles';

export default function RegistrationScreen({navigation, setGlobalError, setGlobalLoading}) {
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
            <View style={[globalStyles.input, globalStyles.inputContainer]}>
                <TextInput
                    style={globalStyles.inputPassword}
                    placeholder="Confirm Password"
                    secureTextEntry={isSecure}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility(isSecure, setIsSecure)}
                                  style={globalStyles.icon}>
                    <Icon name={isSecure ? 'eye-slash' : 'eye'} size={20} color="#000"/>
                </TouchableOpacity>

            </View>

            {/* Button to trigger password generation */}
            <View style={globalStyles.buttonContainer}>
                <Button title="Generate Password" onPress={() => handleGeneratePassword(setPassword)}/>
            </View>
            <Pressable
                style={globalStyles.button}
                onPress={() => {
                    const doPasswordMatch = checkPassword(password, confirmPassword, setGlobalError);
                    if (doPasswordMatch) {
                        setGlobalLoading(true);
                        handleSubmitRegistration(firstname, lastname, email, password, setGlobalError, setGlobalLoading, navigation);
                    }

                }}
            >
                <Text style={globalStyles.text}>Register</Text>
            </Pressable>
        </View>
    );
};

