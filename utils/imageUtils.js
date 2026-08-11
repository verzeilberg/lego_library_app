import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from "react-native";


/**
 * Resizes and compresses an image.
 */
const processImage = async (uri) => {

    const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipulated.uri;
};


/**
 * Opens the device camera.
 */
export const openCameraWithoutUpload = async () => {

    const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
        alert('Camera permission is required!');
        return { canceled: true };
    }

    return ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
    });
};


/**
 * Opens device gallery.
 */
export const openImageLibraryWithoutUpload = async (
    allowsEditing = false,
    selectionLimit = 0,
    allowMultiple = true
) => {

    const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
        Alert.alert('Permission required',
            'Media library permission is required!');
        return { canceled: true };
    }

    return ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing,
        allowsMultipleSelection: allowMultiple,
        selectionLimit,
        quality: 0.7,
    });
};


/**
 * Image selection dialog.
 */
export const selectImage = () => {

    return new Promise((resolve) => {

        Alert.alert(
            "Kies een optie",
            "Wil je een foto nemen of kiezen uit de bibliotheek?",
            [
                { text: "Camera", onPress: async () =>
                        resolve(await openCameraWithoutUpload()) },
                { text: "Bibliotheek", onPress: async () =>
                        resolve(await openImageLibraryWithoutUpload(true,0,false)) },
                { text: "Annuleer", style: "cancel",
                    onPress: () => resolve({ canceled: true }) },
            ]
        );

    });
};


/**
 * Image selection dialog with delete option.
 */
export const selectImageWithDelete = (onDelete) => {
    return new Promise((resolve) => {
        Alert.alert(
            "Kies een optie",
            "Wil je een foto nemen of kiezen uit de bibliotheek?",
            [
                { text: "Camera", onPress: async () =>
                        resolve(await openCameraWithoutUpload()) },
                { text: "Bibliotheek", onPress: async () =>
                        resolve(await openImageLibraryWithoutUpload(true,0,false)) },
                { text: "Verwijder", style: "destructive",
                    onPress: () => { onDelete(); resolve({ canceled: true }); } },
                { text: "Annuleer", style: "cancel",
                    onPress: () => resolve({ canceled: true }) },
            ]
        );
    });
};