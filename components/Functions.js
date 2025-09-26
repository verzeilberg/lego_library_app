import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import {Alert} from "react-native";
import Config from "../config/config";
import * as ImageManipulator from 'expo-image-manipulator';
import jwtDecode from "jwt-decode";
import {refreshToken, handleSubmitDeleteProfile} from "./Apicalls";

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
 * @param {function} setErrorMessage - A setter function to update the error message in the state.
 * @param {function} setLoading - A setter function to indicate the loading state during the token check.
 *
 * @async
 * @throws {Error} If there's an issue retrieving or decoding the token, or during token refresh operations.
 */
export const checkToken = async (navigation, setErrorMessage, setLoading) => {
    try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
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
                navigation.navigate("Profile");
            } else {
                await AsyncStorage.removeItem("token");
                navigation.navigate("Login");
            }
        } else {
            setErrorMessage(null);
            navigation.navigate("Profile");
        }
    } catch (error) {
        console.error("Error checking token", error);
        navigation.navigate("Login");
    } finally {
        setLoading(false);
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

export const selectAndUploadImage2 = async (setImageUri, setData, setUploading) => {
    // Request permission
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
        Alert.alert("Permission required", "You need to grant camera roll permissions.");
        return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Image],
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
 * Prompts the user to select an option to either take a photo using the camera or select an image from the library.
 * The selected image's URI and associated data will be set using the provided setter functions.
 *
 * @param {Function} setImageUri - A function to update the state with the selected image's URI.
 * @param {Function} setData - A function to update the state with additional data related to the selected image.
 * @param {Function} setUploading - A function to update the state indicating the upload process status.
 * @returns {Promise<void>} A promise that resolves once the operation is completed.
 */
export const selectAndUploadImage = async (setImageUri, setData, setUploading) => {
    Alert.alert(
        "Kies een optie",
        "Wil je een foto nemen of kiezen uit de bibliotheek?",
        [
            { text: "Camera", onPress: async () => await openCamera(setImageUri, setData, setUploading) },
            { text: "Bibliotheek", onPress: async () => await openImageLibrary(setImageUri, setData, setUploading) },
            { text: "Annuleer", style: "cancel" },
        ]
    );
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
 * Asynchronously opens the device's image library, allowing the user to select and upload an image with optional editing.
 *
 * This function requests the necessary permissions to access the media library and handles cases where the permissions are not granted.
 * After the user selects an image, it processes the image and uploads it using the provided setter functions.
 *
 * @param {Function} setImageUri - A callback function to set the URI of the selected image after processing.
 * @param {Function} setData - A callback function to set the state or data after uploading the image.
 * @param {Function} setUploading - A callback function to handle the uploading state.
 * @throws Will alert the user if the media library permissions are not granted.
 */
const openImageLibrary = async (setImageUri, setData, setUploading) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
        Alert.alert("Permission required", "Je moet toegang geven tot de fotobibliotheek.");
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Image],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        cropperCircleOverlay: true,
    });

    if (!result.canceled) {
        const uri = await processImage(result.assets[0].uri);
        setImageUri(uri);
        await uploadImage(result.assets[0].uri, setData, setUploading);
    }
};

/**
 * Opens the device's camera to capture an image, processes the captured photo, and uploads the image.
 *
 * This function first requests camera permissions from the user. If permissions are denied,
 * an alert dialog is displayed informing the user that camera access is required. If permissions are
 * granted, the camera is launched for the user to take a photo.
 *
 * After capturing an image, the function processes the image URI, sets the processed image URI
 * using the provided setImageUri function, and uploads the image using the provided setData and
 * setUploading functions.
 *
 * @async
 * @function openCamera
 * @param {Function} setImageUri - A callback function to set the processed image URI.
 * @param {Function} setData - A callback function to update the upload data state.
 * @param {Function} setUploading - A callback function to update the uploading state.
 * @throws {Error} Throws an error if there's an issue with processing or uploading the image.
 */
const openCamera = async (setImageUri, setData, setUploading) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
        Alert.alert("Permission required", "Je moet toegang geven tot de camera.");
        return;
    }

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        cropperCircleOverlay: true,
    });

    if (!result.canceled) {
        const uri = await processImage(result.assets[0].uri);
        setImageUri(uri);
        await uploadImage(result.assets[0].uri, setData, setUploading);
    }
};
/**
 * Asynchronously uploads an image to a specified server endpoint.
 *
 * @param {string} uri - The URI of the image file to be uploaded.
 * @param setData
 * @param setUploading
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
    // Prepare for data
    const formData = new FormData();
    formData.append("file", {
        uri,
        type: "image/jpeg", // Change based on the actual type
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
        setLoading(false);
    }
};

/**
 * Fetches a list of models from the API.
 *
 * This asynchronous function retrieves model data from a specified API endpoint and manages tokens, errors, and loading state. The data is fetched using a GET request with an authorization token obtained from AsyncStorage.
 *
 * @param {Function} setData - A callback function to handle and store successfully fetched data.
 * @param {Function} setError - A callback function to handle and store error messages in case of failures.
 * @param {Function} setLoading - A callback function to manage the loading state. This will be set to false after the operation completes, regardless of success or failure.
 */
export const fetchModelLists= async (setData, setError, setLoading) => {
    const token = await AsyncStorage.getItem('token');
    const apiUrl = Config.API_BASE_URL + '/api/model-lists';
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
        setError(error.message || 'Something went wrong!');
    } finally {
        setLoading(false); // Stop loading after the fetch is complete
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
        quality: 0.7,
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
export const openImageLibraryWithoutUpload = async () => {

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
        alert('Media library permission is required!');
        return { cancelled: true };
    }

    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    return result;
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
                { text: "Bibliotheek", onPress: async () => resolve(await openImageLibraryWithoutUpload()) },
                { text: "Annuleer", style: "cancel", onPress: () => resolve({ cancelled: true }) },
            ]
        );
    });
};

// Delete button
export const confirmDelete = (setLoading, navigation) => {
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
                    handleSubmitDeleteProfile(setLoading, navigation),
            },
        ],
        { cancelable: true }
    );
};

export const confirmation = (setLoading, navigation) => {
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
                    navigation.navigate("Login"),
            },
        ],
        { cancelable: true }
    );
};
