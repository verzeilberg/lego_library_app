import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';

const ProfileScreen = ({navigation}) => {

    return (
        <View style={styles.container}>
            <Button
                title="Logout"
                onPress={() => navigation.navigate('Logout')}
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

export default ProfileScreen;
