import { Alert, Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as ImageManipulator from 'expo-image-manipulator';
import Icon from "react-native-vector-icons/FontAwesome";
import { uploadImagesToSet } from "./Apicalls";
import { openCameraWithoutUpload, openImageLibraryWithoutUpload } from "../utils/imageUtils";

const processImage = async (uri) => {
    const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulated.uri;
};

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

export function ImageOptionsModal({ visible, onClose, onCamera, onLibrary, onDelete }) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableOpacity style={imageModalStyles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={imageModalStyles.actionSheet}>
                    <TouchableOpacity style={imageModalStyles.actionItem} onPress={onCamera}>
                        <Icon name="camera" size={20} color="#333" style={imageModalStyles.actionIcon}/>
                        <Text style={imageModalStyles.actionText}>Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={imageModalStyles.actionItem} onPress={onLibrary}>
                        <Icon name="image" size={20} color="#333" style={imageModalStyles.actionIcon}/>
                        <Text style={imageModalStyles.actionText}>Bibliotheek</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={imageModalStyles.actionItem} onPress={onDelete}>
                        <Icon name="trash" size={20} color="red" style={imageModalStyles.actionIcon}/>
                        <Text style={[imageModalStyles.actionText, {color: 'red'}]}>Verwijder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[imageModalStyles.actionItem, imageModalStyles.actionCancel]} onPress={onClose}>
                        <Icon name="times" size={20} color="#333" style={imageModalStyles.actionIcon}/>
                        <Text style={imageModalStyles.actionText}>Annuleer</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const imageModalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    actionSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 30,
        paddingTop: 8,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    actionCancel: {
        borderBottomWidth: 0,
    },
    actionIcon: {
        width: 28,
    },
    actionText: {
        fontSize: 16,
        color: '#333',
    },
});
