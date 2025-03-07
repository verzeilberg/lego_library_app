import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useRef} from 'react';
import * as ImagePicker from "expo-image-picker";
import {Alert} from "react-native";
import Config from "../config/config";



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
export const handleKeyPress = (e, index, code, inputRefs) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
    }
};


/**
 * An asynchronous function to check for the existence of a token in AsyncStorage.
 * If a token is found, it clears any current error message, removes the token from AsyncStorage,
 * and navigates to the 'Profile' screen. If an error occurs, it will log the error to the console.
 * After the process completes, it will set the loading state to false.
 *
 * @returns {Promise<void>} A promise that resolves when the token check and any subsequent actions are complete.
 **/
export const checkToken = async (navigation, setErrorMessage, setLoading) => {
    try {
        await AsyncStorage.clear();
        const token = await AsyncStorage.getItem('token');
        if (token) {
            setErrorMessage(null);
            navigation.navigate('Profile');
        }
    } catch (error) {
        console.error('Error logging out', error);
    } finally {
        setLoading(false);
    }
};

export const togglePasswordVisibility = (isSecure, setIsSecure) => {
    setIsSecure(!isSecure);
};

// Function to generate a strong password
export const generatePassword = (length = 12) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?';
    let newPassword = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        newPassword += chars[randomIndex];
    }
    return newPassword;
};

/**
 * Handles the generation of a new password and updates the state with the generated password.
 *
 * @function
 * @param {Function} setPassword - A setter function used to update the password state.
 */
export const handleGeneratePassword = (setPassword) => {
    const generatedPassword = generatePassword(16); // Suggest 16 character passwords
    setPassword(generatedPassword);
};

/**
 * Validates if the password and confirmPassword match.
 *
 * @param {string} password - The main password.
 * @param {string} confirmPassword - The password to confirm.
 * @param {function} setError - Function to set the error or success message.
 */
export const checkPassword = (password, confirmPassword, setErrorMessage) => {
    if (password === confirmPassword && password.length > 0) {
        return true;
    } else {
        setErrorMessage('Passwords do not match!');
        return false;
    }
};

/**
 * A function to handle changes in input fields.
 *
 * The function updates the array of codes with new input text at the specified index.
 * If the length of the text is one character and the current index is less than 3,
 * it automatically moves the focus to the next input field.
 *
 * @param {string} text - The new input text entered by the user.
 * @param {number} index - The index of the input field being modified.
 * @param {Function} setCode - A state updating function to update the code array.
 */
export const handleChange = (text, index, code,  setCode, inputRefs) => {
    const newCode = [...code];
    newCode[index] = text;

    if (text.length === 1 && index < 3) {
        inputRefs.current[index + 1].focus();
    }
    setCode(newCode);
};

/**
 * Asynchronously selects an image from the device's media library and uploads it if an image is selected.
 *
 * This function performs the following steps:
 * 1. Requests permission to access the device's media library. If permission is denied,
 *    an alert is shown to the user, and the function terminates.
 * 2. Opens the image picker to allow the user to select an image from their library.
 *    Only images are selectable, and users can crop the image with a predefined aspect ratio.
 * 3. If an image is successfully selected, its URI is stored and the image is uploaded.
 *
 * Ensure that this function is executed in a compatible environment where the `ImagePicker`
 * module and the `uploadImage` and `setImageUri` dependencies are available.
 *
 * @async
 * @function
 * @throws Will throw an error if the upload process encounters an issue.
 */
export const selectAndUploadImage = async (setImageUri, setData, setUploading) => {
    // Request permission
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
        Alert.alert("Permission required", "You need to grant camera roll permissions.");
        return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled) {
        setImageUri(result.assets[0].uri); // Store the selected image preview
        await uploadImage(result.assets[0].uri, setData, setUploading);
    }
};

/**
 * Asynchronously uploads an image to a specified server endpoint.
 *
 * @param {string} uri - The URI of the image file to be uploaded.
 * @returns {Promise<void>} A promise that resolves when the image is successfully uploaded or rejects if an error occurs.
 *
 * This function handles image upload by:
 * - Preparing the form data with the image file.
 * - Sending the image to a configured API endpoint using a POST request.
 * - Using an authentication token stored in AsyncStorage to authorize the request.
 * - Displaying alerts for upload success or failure.
 * - Managing the upload state via `setUploading`.
 *
 * Note: The URI should correspond to an existing image in the specified format (e.g., "image/jpeg").
 */
export const uploadImage = async (uri, setData, setUploading) => {
    // Prepare form data
    const formData = new FormData();
    formData.append("file", {
        uri,
        type: "image/jpeg", // Change based on actual type
        name: "upload.jpg",
    });

    try {
        // API endpoint for registration
        const apiUrl = Config.API_BASE_URL+'/api/user/media_objects';
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer '+token,
                "Content-Type": "multipart/form-data",
            },
            body: formData,
        });

        const jsonData = await response.json();
        if(jsonData['error']) {
            Alert.alert("Upload Error", jsonData['error']);
            return;
        }
        setData(jsonData);
    } catch (error) {
        console.log(error);
        Alert.alert("Upload Error", error.message);
    } finally {
        setUploading(false);
    }
};

export const fetchData = async (setData, setError, setLoading) => {
    const token = await AsyncStorage.getItem('token');
    const apiUrl = Config.API_BASE_URL + '/api/user-data';
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        });
        if (!response) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
    } catch (error) {
        setError(error.message || 'Something went wrong!');
    } finally {
        setLoading(false); // Stop loading after the fetch is complete
    }
};
