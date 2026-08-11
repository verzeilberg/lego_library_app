import React, {useState} from 'react';
import {View, TextInput, Text, Pressable} from 'react-native';
import {useStyles} from "../../styles";
import {handleForgotPasswordSubmit} from "../../components/Apicalls";
import ErrorBanner from "../../components/ui/ErrorBanner";

const ForgotPasswordScreen = ({navigation, setGlobalError, setGlobalLoading}) => {
    const styles = useStyles();
    const [email, setEmail] = useState('');
    const handlePress = () => {
        setGlobalLoading(true);
        handleForgotPasswordSubmit(email, setGlobalError, setGlobalLoading, navigation);
    };

    return (
        <View style={styles.flex1}>
            <ErrorBanner />
            <View style={styles.container}>
            <Text style={styles.paragraph}>Please fill in your email address to get a code to change your password. </Text>
            <TextInput
                style={styles.input}
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
                style={styles.button}
                onPress={handlePress}
            >
                <Text style={[styles.text, {color: '#fff'}]}>Reset password</Text>
            </Pressable>
        </View>
            </View>
    );

};

export default ForgotPasswordScreen;
