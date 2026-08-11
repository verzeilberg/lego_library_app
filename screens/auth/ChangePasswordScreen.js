import React, {useState} from 'react';
import {View, TextInput, Button, Text, Pressable, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {checkPassword, handleGeneratePassword, togglePasswordVisibility} from "../../utils/passwordUtils";
import {handlePasswordSubmit} from "../../components/Apicalls";
import {useStyles} from "../../styles";
import ErrorBanner from "../../components/ui/ErrorBanner";

export default function ChangePasswordScreen({navigation, setGlobalError, setGlobalLoading}) {
    const styles = useStyles();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSecure, setIsSecure] = useState(true);

    return (
        <View style={styles.flex1}>
            <ErrorBanner />
            <View style={styles.container}>
            <View style={[styles.input, styles.inputContainer]}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="Enter Password"
                    secureTextEntry={isSecure}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility(isSecure, setIsSecure)}style={styles.icon}>
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
                <TouchableOpacity onPress={() => togglePasswordVisibility(isSecure, setIsSecure)}style={styles.icon}>
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
                        handlePasswordSubmit(password, navigation, setGlobalError, setGlobalLoading)
                    }
                }}
            >
                <Text style={[styles.text, {color: '#fff'}]}>Save</Text>
            </Pressable>
            </View>
        </View>
    );
};
