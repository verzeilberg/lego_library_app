import {Modal, Text, Switch, TextInput, TouchableOpacity, View, Pressable, Image} from "react-native";
import {globalStyles} from "../styles";
import React, {useState, useEffect} from "react";
import {handleSubmitAddEditBoard, handleSubmitAddSet} from "./Apicalls";
import Config from "../config/config";
import {selectImage} from "./Functions";
import {MaterialIcons} from '@expo/vector-icons';

export default function AddModal({
                                     modalVisible,
                                     setModalVisible,
                                     onDataUpdated,
                                     setGlobalError,
                                     setGlobalLoading,
                                     mode = 'add',
                                     data = null
                                 }) {
    const maxLength = 50;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublicPrivate, setIsPublicPrivate] = useState(false);
    const [legoNmbr, setLegoNmbr] = useState('');
    const [addLegoParts, setAddLegoParts] = useState(false);
    const [addLegoImages, setAddLegoImages] = useState(false);addLegoImages

    const [selectedImage, setSelectedImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const toggleSwitch = () => setIsPublicPrivate(prev => !prev);
    const toggleSwitch2 = () => setAddLegoParts(prev => !prev);
    const toggleSwitch3 = () => setAddLegoImages(prev => !prev);

    // Reset or prefill fields whenever modal opens
    useEffect(() => {
        if (!modalVisible) return;

        setErrorMessage(null);

        if (mode === 'edit' && data) {
            setTitle(data.title || '');
            setDescription(data.description || '');
            setIsPublicPrivate(data.isPublic || false);
            setSelectedImage(data.filePath ? Config.API_BASE_URL + data.filePath : null);

            // reset addItem fields
            setLegoNmbr('');
            setAddLegoParts(false);
            setAddLegoImages(false);

        } else if (mode === 'addItem') {

            // reset addItem form completely
            setLegoNmbr('');
            setAddLegoParts(false);
            setAddLegoImages(false);

            // reset bord fields
            setTitle('');
            setDescription('');
            setIsPublicPrivate(false);
            setSelectedImage(null);

        } else {

            // add mode
            setTitle('');
            setDescription('');
            setIsPublicPrivate(false);
            setSelectedImage(null);

            setLegoNmbr('');
            setAddLegoParts(false);
            setAddLegoImages(false);
        }

    }, [modalVisible, mode, data]);

    const pickImage = async () => {
        const result = await selectImage();
        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleSubmit = () => {
        setGlobalLoading(true);
        if (mode === 'add') {
            handleSubmitAddEditBoard(data?.bordId, title, description, isPublicPrivate, selectedImage, setGlobalError, setGlobalLoading, setModalVisible, onDataUpdated, mode);
        } else if (mode === 'addItem') {
            if (!data?.bordId) {
                setErrorMessage('No bord ID provided.');
                return;
            }
            handleSubmitAddSet(data.bordId, legoNmbr, addLegoImages, addLegoParts, setGlobalError, setGlobalLoading, setModalVisible, onDataUpdated);
        } else if (mode === 'edit') {
            if (!data?.id) {
                setErrorMessage('No bord ID provided for edit.');
                return;
            }
            handleSubmitAddEditBoard(data.id, title, description, isPublicPrivate, selectedImage, setGlobalError, setGlobalLoading, setModalVisible, onDataUpdated, mode);
        }
    };

    const getTitleText = () => {
        switch (mode) {
            case 'add':
                return 'Bord aanmaken';
            case 'addItem':
                return 'Set toevoegen';
            case 'edit':
                return 'Bord bewerken';
            default:
                return 'Bord aanmaken';
        }
    };

    const getButtonText = () => {
        switch (mode) {
            case 'add':
                return 'Bord toevoegen';
            case 'addItem':
                return 'Set toevoegen';
            case 'edit':
                return 'Wijzigingen opslaan';
            default:
                return 'Opslaan';
        }
    };

    return (
        <View style={globalStyles.modalPlaceHolder}>
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={globalStyles.modalBackground}>
                    <View style={globalStyles.modalContainer}>
                        {/* Header */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            marginBottom: 10
                        }}>
                            <Text style={globalStyles.h1}>{getTitleText()}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={28} color="gray"/>
                            </TouchableOpacity>
                        </View>

                        {mode === 'addItem' ? (
                            <>
                                {/* Info text above the input */}
                                <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>
                                    Voer het Lego-nummer in:
                                </Text>

                                {/* TextInput for addItem mode */}
                                <TextInput
                                    style={globalStyles.input2}
                                    value={legoNmbr}
                                    onChangeText={setLegoNmbr}
                                    placeholder="Lego nummer"
                                />

                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{marginRight: 10, fontWeight: 'bold'}}>
                                        Add lego image(s)
                                    </Text>
                                    <Switch
                                        trackColor={{false: '#767577', true: '#349A20FF'}}
                                        thumbColor={addLegoImages ? '#3dd51e' : '#f4f3f4'}
                                        onValueChange={toggleSwitch3}
                                        value={addLegoImages}
                                    />
                                </View>

                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{marginRight: 10, fontWeight: 'bold'}}>
                                        Add lego parts
                                    </Text>
                                    <Switch
                                        trackColor={{false: '#767577', true: '#349A20FF'}}
                                        thumbColor={addLegoParts ? '#3dd51e' : '#f4f3f4'}
                                        onValueChange={toggleSwitch2}
                                        value={addLegoParts}
                                    />
                                </View>
                            </>
                        ) : (
                            // Else, show image picker and inputs
                            <>
                                {/* Image picker */}
                                <TouchableOpacity
                                    style={globalStyles.parentImageRectangleContainer}
                                    onPress={pickImage}
                                >
                                    <Image
                                        source={selectedImage ? {uri: selectedImage} : {uri: Config.API_BASE_URL}}
                                        style={globalStyles.imageRectangleContainer}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>

                                {/* Title input */}
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: 10
                                }}>
                                    <TextInput
                                        style={globalStyles.input2}
                                        value={title}
                                        onChangeText={(t) => {
                                            if (t.length <= maxLength) setTitle(t);
                                        }}
                                        placeholder="Titel"
                                        maxLength={maxLength}
                                    />
                                    <TextInput
                                        style={globalStyles.counter}
                                        value={`${title.length}/${maxLength}`}
                                        editable={false}
                                        pointerEvents="none"
                                    />
                                </View>

                                {/* Description input */}
                                <TextInput
                                    style={globalStyles.textArea}
                                    multiline
                                    numberOfLines={4}
                                    onChangeText={setDescription}
                                    placeholder="Omschrijving"
                                    textAlignVertical="top"
                                    value={description}
                                />
                            </>
                        )}

                        {/* Public/Private switch (only for bords) */}
                        {mode !== 'addItem' && (
                            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
                                <Text style={{marginRight: 10}}>
                                    {isPublicPrivate ? 'Public' : 'Prive'}
                                </Text>
                                <Switch
                                    trackColor={{false: '#767577', true: '#81b0ff'}}
                                    thumbColor={isPublicPrivate ? '#007BFF' : '#f4f3f4'}
                                    onValueChange={toggleSwitch}
                                    value={isPublicPrivate}
                                />
                            </View>
                        )}

                        {/* Submit button */}
                        <Pressable style={globalStyles.button} onPress={handleSubmit}>
                            <Text style={globalStyles.text}>{getButtonText()}</Text>
                        </Pressable>

                        {errorMessage && (
                            <Text style={{color: 'red', marginTop: 10}}>{errorMessage}</Text>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
