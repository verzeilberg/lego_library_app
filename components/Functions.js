/**
 * =========================================================
 * Imports
 * =========================================================
 */
import { Alert, View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import jwtDecode from "jwt-decode";
import { Ionicons } from "@expo/vector-icons";
import { refreshToken, handleSubmitDeleteProfile, handleSubmitSetRating, uploadImagesToSet } from "./Apicalls";
import { globalStyles } from "../styles";

/**
 * =========================================================
 * Authentication / Token Utilities
 * =========================================================
 */


/**
 * Checks the stored JWT token and determines whether the user
 * should be redirected to login or allowed into the app.
 *
 * Behavior:
 * - Retrieves token from AsyncStorage
 * - Decodes token to check expiration
 * - Attempts token refresh if expired
 * - Redirects to Login if refresh fails
 * - Redirects to MainTabs if token is valid
 *
 * @param {object} navigation - React Navigation object for routing.
 * @param {Function} setGlobalError - Global error state setter.
 * @param {Function} setGlobalLoading - Global loading state setter.
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

            // Attempt to refresh expired token
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
 * Validates that password and confirmPassword match.
 *
 * If they do not match, an error message will be set.
 *
 * @param {string} password - Primary password.
 * @param {string} confirmPassword - Confirmation password.
 * @param {Function} setGlobalError - Error state setter.
 * @returns {boolean} True if valid, false otherwise.
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
 * =========================================================
 * Image Utilities
 * =========================================================
 */


/**
 * Processes an image before uploading.
 *
 * Actions performed:
 * - Resizes image to max width 800px
 * - Compresses to reduce file size
 * - Converts to JPEG
 * - Adds cache busting query string
 *
 * @param {string} uri - Image URI.
 * @returns {Promise<string>} Processed image URI.
 */
const processImage = async (uri) => {
    const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipulated.uri + `?t=${Date.now()}`;
};


/**
 * Opens the device camera to capture a photo.
 *
 * Behavior:
 * - Requests camera permission
 * - Opens camera UI
 * - Allows editing
 *
 * @returns {Promise<object>} Camera result or cancelled object.
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
 * Opens the device image library to select images.
 *
 * Options:
 * - Allows editing
 * - Multiple selection
 * - Selection limits
 *
 * @param {boolean} allowsEditing
 * @param {number} selectionLimit
 * @param {boolean} allowMultiple
 *
 * @returns {Promise<object>} Image picker result.
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

    return result;
};


/**
 * Displays an option dialog for selecting a single image.
 *
 * Options:
 * - Take a photo
 * - Select from library
 * - Cancel
 *
 * @returns {Promise<object>} Image result or cancelled object.
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


/**
 * Handles selecting and uploading multiple images.
 *
 * Workflow:
 * 1. User chooses camera or library
 * 2. Images are processed (resize/compress)
 * 3. Images are uploaded to the backend
 *
 * @param setNumber
 * @param bordId
 * @param setGlobalError
 * @param setGlobalLoading
 *
 * @returns {Promise<object>}
 */
export const selectMultipleImage = async (setNumber, bordId, setGlobalError, setGlobalLoading) => {
    return new Promise((resolve) => {

        const handleAsyncWork = async (input, isCamera = false) => {
            try {

                setGlobalLoading(true);

                let assetsArray;

                if (isCamera) {
                    if (input.assets && input.assets.length > 0) {
                        assetsArray = input.assets;
                    } else if (input.uri) {
                        assetsArray = [input];
                    } else {
                        throw new Error("No valid URI found from camera");
                    }
                } else {
                    assetsArray = input;
                }

                const processedImages = await Promise.all(
                    assetsArray.map(asset =>
                        processImage(asset.uri).then(uri => ({ uri }))
                    )
                );

                const uploadedResults = await uploadImagesToSet(
                    processedImages,
                    setNumber,
                    bordId,
                    setGlobalError
                );

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


/**
 * =========================================================
 * Profile Utilities
 * =========================================================
 */


/**
 * Shows a confirmation dialog before deleting a user profile.
 *
 * If confirmed the profile deletion API call is triggered.
 *
 * @param {Function} setGlobalLoading
 * @param {Function} setGlobalError
 * @param {object} navigation
 */
export const confirmDelete = (setGlobalLoading, setGlobalError, navigation) => {

    Alert.alert(
        "Delete Profile",
        "Are you sure you want to delete your profile?",
        [
            { text: "No", style: "cancel" },
            {
                text: "Yes",
                onPress: () =>
                    handleSubmitDeleteProfile(setGlobalLoading, setGlobalError, navigation)
            },
        ],
        { cancelable: true }
    );
};


/**
 * =========================================================
 * UI Components
 * =========================================================
 */


/**
 * RatingStars Component
 *
 * Displays a star-based rating UI.
 *
 * Features:
 * - Shows up to 5 stars
 * - Supports half-star display
 * - Can be read-only
 * - Submits rating to backend
 * - Updates overall rating if returned
 *
 * Props:
 * @param rating
 * @param onChange
 * @param setId
 * @param setGlobalLoading
 * @param setGlobalError
 * @param readonly
 * @param size
 * @param showLabel
 * @param style
 * @param setOverallRating
 *
 * @returns {JSX.Element}
 */
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
                                        setOverallRating,
                                    }) {

    /**
     * Submits a rating for the current set.
     *
     * Updates:
     * - Personal rating
     * - Overall rating if returned from backend
     *
     * @param {number} value
     */
    const rateSet = async (value) => {

        if (readonly) return;

        try {

            const updatedOverall = await handleSubmitSetRating(
                setId,
                value,
                setGlobalError,
                setGlobalLoading
            );

            onChange?.(value);

            if (updatedOverall !== null && typeof setOverallRating === 'function') {
                setOverallRating(updatedOverall);
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
                        iconName = 'star';
                    } else if (rating >= star - 0.5) {
                        iconName = 'star-half';
                    } else {
                        iconName = 'star-outline';
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