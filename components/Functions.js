import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, Platform, Alert, Button, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import { useNavigation } from '@react-navigation/native';

/**
 * Updates the code at the specified index with the given text and automatically focuses the next input if text length is 1.
 *
 * @param {string} text - The new text to set at the specified index.
 * @param {number} index - The index of the code array to update.
 */
export const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;

    // Move to next input if the length of text is 1
    if (text.length === 1 && index < 3) {
        inputRefs.current[index + 1].focus();
    }
    setCode(newCode);
};

/**
 * Handles the key press event for a given input element.
 *
 * @param {object} e - The event object associated with the key press event.
 * @param {number} index - The index of the input element in the inputRefs array.
 *
 * The function listens for the 'Backspace' key press event and,
 * if the associated input element at the given index is empty,
 * it shifts the focus to the previous input element in the array.
 */
export const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
    }
};


export const checkToken = async () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true); // To show loading spinner

    try {
        console.log('Checking token...');
        const token = await AsyncStorage.getItem('token');
        if (token) {
            navigation.navigate('Profile');
        }
    } catch (error) {
        console.error('Error checking token:', error);
    } finally {
        console.log('Token check complete');
        setLoading(false);
    }
};
