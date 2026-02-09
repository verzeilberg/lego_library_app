import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import {Alert, View, Text, TouchableOpacity} from "react-native";
import Config from "../config/config";
import * as ImageManipulator from 'expo-image-manipulator';
import jwtDecode from "jwt-decode";
import {refreshToken, handleSubmitDeleteProfile, handleSubmitSetRating} from "./Apicalls";
import {globalStyles} from "../styles";
import React, { useState } from "react";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler } from "react-native-gesture-handler";

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
 * Asynchronously checks the token stored in AsyncStorage to verify its validity and redirects
 * the user to the appropriate screen based on the token's status. If the token is missing,
 * expired, or invalid, the user is redirected to the "Login" screen. If the token is valid
 * or successfully refreshed, the user is redirected to the "Profile" screen.
 *
 * @param {object} navigation - The navigation object used for redirecting the user to different screens.
 * @param setGlobalError
 * @param setGlobalLoading
 *
 * @async
 * @throws {Error} If there's an issue retrieving or decoding the token, or during token refresh operations.
 */
export const checkToken = async (navigation, setGlobalError, setGlobalLoading) => {
    try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
            setGlobalLoading(false);
            navigation.navigate("Login");
            return;
        }

        // Decode token and check expiry
        const decoded = jwtDecode(token);
        //@todo restore code
        //const now = Date.now().valueOf() / 1000;
        const now = (Date.now().valueOf() / 1000) + 999999;

        if (decoded.exp && decoded.exp < now) {
            // Try to refresh the token
            const newToken = await refreshToken(token);
            if (newToken) {
                await AsyncStorage.setItem("token", newToken);
                setGlobalLoading(false);
                navigation.replace("MainTabs");
            } else {
                await AsyncStorage.removeItem("token");
                setGlobalLoading(false);
                navigation.navigate("Login");
            }
        } else {
            setGlobalError(null);
            setGlobalLoading(false);
            navigation.replace("MainTabs");
        }
    } catch (error) {
        navigation.navigate("Login");
    } finally {
        setGlobalLoading(false);
    }
};




/**
 * Toggles the visibility of a password field by inverting the current secure state.
 *
 * @param {boolean} isSecure - The current state indicating whether the password field is secure (hidden).
 * @param {Function} setIsSecure - A function to update the state of the password field's visibility.
 */
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
 * @param setGlobalError
 */
export const checkPassword = (password, confirmPassword, setGlobalError) => {
    if (password === confirmPassword && password.length > 0) {
        return true;
    } else {
        setGlobalError('Passwords do not match!');
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
 * Processes an image by resizing, compressing, and adding a cache-busting query parameter.
 *
 * This function takes an image URI, resizes the image to a maximum width of 800 pixels,
 * compresses it to reduce file size, and ensures the image is saved in JPEG format.
 * Additionally, a cache-busting timestamp is appended to the output URI to prevent
 * caching issues.
 *
 * @param {string} uri - The URI of the image to process.
 * @returns {Promise<string>} A promise that resolves to the processed image URI with a cache-busting query parameter.
 */
const processImage = async (uri) => {
    // Verklein en comprimeer de afbeelding om sneller te laden
    const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Max 800px breed
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Voeg cache-busting toe
    return manipulated.uri + `?t=${Date.now()}`;
};

/**
 *
 * @param images
 * @param setNumber
 * @param listId
 * @param setGlobalError
 * @returns {Promise<any|null>}
 */
export const uploadImagesToSet = async (images, setNumber, listId, setGlobalError) => {
    if (!images || images.length === 0) return [];

    const formData = new FormData();

    images.forEach((asset, i) => {
        formData.append("files[]", {
            uri: asset.uri,
            type: asset.type || "image/jpeg",
            name: `image_${Date.now()}_${i}.jpg`,
        });
    });



    try {
        const apiUrl = `${Config.API_BASE_URL}/api/lego/set-lists/${listId}/sets/${setNumber}/add-images`;
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
            body: formData,
        });

        const data = await response.json();
        if (data.error) {
            setGlobalError("Upload Error", data.error);
            return null;
        }

        return data; // Should be an array of uploaded images
    } catch (error) {
        setGlobalError("Upload Error", data.error);
        return null;
    }
};

export const fetchData = async (setData, setGlobalError, setGlobalLoading) => {
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
            setGlobalError(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong!');
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Fetches a list of models from the API.
 *
 * This asynchronous function retrieves model data from a specified API endpoint and manages tokens, errors, and loading state. The data is fetched using a GET request with an authorization token obtained from AsyncStorage.
 *
 * @param {Function} setData - A callback function to handle and store successfully fetched data.
 * @param setGlobalError
 * @param setGlobalLoading
 */
export const fetchModelLists= async (setData, setGlobalError, setGlobalLoading) => {
    const token = await AsyncStorage.getItem('token');
    const apiUrl = Config.API_BASE_URL + '/api/set-lists';
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
        });
        if (!response) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong!');
        setGlobalLoading(false)
    } finally {
        setGlobalLoading(false); // Stop loading after the fetch is complete
    }
};

/**
 * Opens the camera on the user's device to capture an image without uploading it.
 *
 * This function requests camera permissions from the user and, if granted, launches the camera
 * to allow the user to take a photo. The photo can then be edited before being finalized.
 * If the permission is denied, an alert is displayed and the function returns an object
 * indicating the operation was cancelled.
 *
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object containing details of the captured image
 * or an object with { cancelled: true } if the operation was cancelled.
 */
export const openCameraWithoutUpload = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
        alert('Camera permission is required!');
        return { cancelled: true };
    }

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    return result;
};

/**
 * Opens the device's image library to allow the user to select an image without uploading it.
 *
 * This function requests permission to access the media library. If the permission is denied,
 * an alert is displayed to inform the user, and the function returns an object indicating the operation
 * was cancelled. If the permission is granted, the function launches the device's image library where the
 * user can select an image. The selected image can be edited according to specified options,
 * such as aspect ratio and quality.
 *
 * @async
 * @function
 * @returns {Promise<object>} A promise that resolves to an object containing details of the selected image, or
 * an object with a `cancelled` property set to `true` if the user did not grant permission or cancelled the operation.
 */
export const openImageLibraryWithoutUpload = async (
    allowsEditing = false,
    selectionLimit = 0,
    allowMultiple = true
) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
        Alert.alert('Permission required', 'Media library permission is required!');
        return { canceled: true };
    }
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,

        allowsEditing: allowsEditing,
        allowsMultipleSelection: allowMultiple,
        selectionLimit: selectionLimit,

        quality: 1,
    });

    return result; // assets always here
};

/**
 * Prompts the user to select an option for obtaining an image.
 * Displays an alert with options to either take a photo using the camera,
 * pick an image from the library, or cancel the operation. The method returns
 * a promise that resolves to the selected image data or an indication that
 * the operation was canceled.
 *
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object containing the image data
 * or an object with a cancelled flag when the user cancels the operation.
 */
export const selectImage = () => {
    return new Promise((resolve) => {
        Alert.alert(
            "Kies een optie",
            "Wil je een foto nemen of kiezen uit de bibliotheek?",
            [
                { text: "Camera", onPress: async () => resolve(await openCameraWithoutUpload()) },
                { text: "Bibliotheek", onPress: async () => resolve(await openImageLibraryWithoutUpload(true, 0, false)) },
                { text: "Annuleer", style: "cancel", onPress: () => resolve({ cancelled: true }) },
            ]
        );
    });
};

export const selectMultipleImage = async (setNumber, bordId, setGlobalError, setGlobalLoading) => {
    return new Promise((resolve) => {
        const handleAsyncWork = async (input, isCamera = false) => {
            try {
                setGlobalLoading(true);

                let assetsArray;

                if (isCamera) {
                    // Camera result might be a single object or an array of assets
                    if (input.assets && input.assets.length > 0) {
                        // New API style
                        assetsArray = input.assets;
                    } else if (input.uri) {
                        // Old API style
                        assetsArray = [input];
                    } else {
                        throw new Error("No valid URI found from camera");
                    }
                } else {
                    assetsArray = input; // library result
                }

                // Process all images
                const processedImages = await Promise.all(
                    assetsArray.map(asset => processImage(asset.uri).then(uri => ({ uri })))
                );

                // Upload all images at once
                const uploadedResults = await uploadImagesToSet(processedImages, setNumber, bordId, setGlobalError);

                resolve({ cancelled: false, uploaded: uploadedResults });
            } catch (error) {
                setGlobalError(error?.message);
                resolve({ cancelled: true });
            } finally {
                setGlobalLoading(false);
            }
        };

        Alert.alert(
            "Kies een optie",
            "Wil je een foto nemen of foto's kiezen uit de bibliotheek?",
            [
                {
                    text: "Camera",
                    onPress: async () => {
                        const result = await openCameraWithoutUpload();
                        if (result?.cancelled) {
                            resolve({ cancelled: true });
                            return;
                        }
                        handleAsyncWork(result, true);
                    },
                },
                {
                    text: "Bibliotheek",
                    onPress: async () => {
                        const result = await openImageLibraryWithoutUpload(false, 10, true);
                        if (result?.canceled || !result.assets?.length) {
                            resolve({ cancelled: true });
                            return;
                        }
                        handleAsyncWork(result.assets, false);
                    },
                },
                {
                    text: "Annuleer",
                    style: "cancel",
                    onPress: () => resolve({ cancelled: true }),
                },
            ]
        );
    });
};
// Delete button
export const confirmDelete = (setGlobalLoading, setGlobalError, navigation) => {
    Alert.alert(
        "Delete Profile",
        "Are you sure you want to delete your profile?",
        [
            {
                text: "No",
                style: "cancel",
            },
            {
                text: "Yes",
                onPress: () =>
                    handleSubmitDeleteProfile(setGlobalLoading, setGlobalError, navigation)
            },
        ],
        { cancelable: true }
    );
};

export default function RatingStars({
                                        rating,
                                        onChange,
                                        setId,
                                        setGlobalLoading,
                                        setGlobalError,
                                        readonly = false,
                                        size = 25,
                                        showLabel = true,
                                        style,
                                        setOverallRating, // optional callback to update overall rating
                                    }) {
    const rateSet = async (value) => {
        if (readonly) return;

        try {
            const updatedOverall = await handleSubmitSetRating(
                setId,
                value,
                setGlobalError,
                setGlobalLoading
            );

            onChange?.(value); // update personal rating

            if (updatedOverall !== null && typeof setOverallRating === 'function') {
                setOverallRating(updatedOverall); // update general rating
            }

        } catch (error) {
            setGlobalError?.("Failed to submit rating");
        }
    };

    return (
        <View style={[globalStyles.containerSlider, style]}>
            {!readonly && showLabel && (
                <Text style={globalStyles.labelSlider}>Your Rating:</Text>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                    let iconName;

                    if (rating >= star) {
                        iconName = 'star'; // full star
                    } else if (rating >= star - 0.5) {
                        iconName = 'star-half'; // half star
                    } else {
                        iconName = 'star-outline'; // empty star
                    }

                    return (
                        <TouchableOpacity
                            key={star}
                            disabled={readonly}
                            onPress={() => rateSet(star)}
                            style={{ marginRight: 2 }}
                            activeOpacity={readonly ? 1 : 0.7}
                        >
                            <Ionicons
                                name={iconName}
                                size={size}
                                color={iconName === 'star-outline' ? '#ccc' : '#f5b301'}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}



