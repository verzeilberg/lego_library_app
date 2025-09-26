import {Modal, Text, Switch, TextInput, TouchableOpacity, View, Pressable, Image} from "react-native";
import {globalStyles} from "../styles";
import React, {useState} from "react";
import {checkPassword, selectAndUploadImage} from "./Functions";
import {handleSubmitAddBoard, handleSubmitRegistration} from "./Apicalls";
import Icon from "react-native-vector-icons/FontAwesome";
import Config from "../config/config";
import {selectImage} from "./Functions";

export default function AddModal({onDataUpdated}) {
    const [modalVisible, setModalVisible] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [data, setData] = useState(null); // To store the fetched data
    const [title, setTitle] = useState('');
    const maxLength = 50;
    const [description, setDescription] = useState('');
    const isMaxReached = title.length >= maxLength;
    const [isPublicPrivate, setIsPublicPrivate] = useState(false);
    const toggleSwitch = () => setIsPublicPrivate(previousState => !previousState);
    const [errorMessage, setErrorMessage] = useState(null);

    const [selectedImage, setSelectedImage] = useState(null);

    const pickImage = async () => {
        const result = await selectImage();
        console.log('Image result:', result);

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    return (
        <View style={globalStyles.modalPlaceHolder}>

            <TouchableOpacity style={globalStyles.openModalButton} onPress={() => setModalVisible(true)}>
                <Text style={globalStyles.openModalButtonText}>
                    <Icon name={'plus'} size={20}/>
                </Text>
            </TouchableOpacity>

            {/* Modal popup */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={globalStyles.modalBackground}>
                    <View style={globalStyles.modalContainer}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <Text style={globalStyles.h1}>Bord aanmaken</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', width: "100%"}}>
                            <TouchableOpacity
                                style={globalStyles.parentImageRectangleContainer}
                                onPress={pickImage}
                            >
                                <Image
                                    source={selectedImage ? { uri: selectedImage } : { uri: Config.API_BASE_URL }}
                                    style={globalStyles.imageRectangleContainer}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <TextInput
                                style={globalStyles.input2}
                                value={title}
                                onChangeText={(t) => {
                                    if (t.length <= maxLength) {
                                        setTitle(t);
                                    }
                                }}
                                placeholder="Titel"
                                multiline={false}
                                maxLength={maxLength}
                            />
                            {/* Overlay de teller op de TextInput */}
                            <TextInput
                                style={globalStyles.counter}
                                value={`${title.length}/${maxLength}`}
                                editable={false}
                                pointerEvents="none"
                            />
                        </View>

                        <TextInput
                            style={globalStyles.textArea}
                            multiline
                            numberOfLines={4}
                            onChangeText={setDescription}
                            placeholder="Omschrijving"
                            textAlignVertical="top"
                            value={description}
                        />
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{marginRight: 10}}>
                                {isPublicPrivate ? 'Public' : 'Prive'}
                            </Text>
                            <Switch
                                trackColor={{false: '#767577', true: '#81b0ff'}}
                                thumbColor={isPublicPrivate ? '#007BFF' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isPublicPrivate}
                            />
                        </View>

                        <Pressable
                            style={globalStyles.button}
                            onPress={() => handleSubmitAddBoard(title, description, isPublicPrivate, selectedImage, setErrorMessage, setModalVisible, onDataUpdated)}
                        >
                            <Text style={globalStyles.text}>Bord toevoegen</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
