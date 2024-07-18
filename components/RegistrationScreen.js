import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const RegistrationScreen = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        // API endpoint for registration
        const apiUrl = 'http://192.168.2.31/api/public/user/register';

        // Sending json data
        const data = {
            firstName: firstname,
            lastName: lastname,
            email: email,
            userName: username,
            plainPassword: password
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if required
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                // Handle result from API, e.g., display success message, navigate to login screen, etc.
                console.log('Registration successful', result);
            })
            .catch(error => {
                console.error('Error registering:', error);
            });
    };

    return (
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
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Username"
                onChangeText={text => setUsername(text)}
                value={username}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={text => setPassword(text)}
                value={password}
                secureTextEntry
            />
            <Button
                title="Register"
                onPress={handleSubmit}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});

export default RegistrationScreen;
