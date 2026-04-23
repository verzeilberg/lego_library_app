import { Modal, Text, Switch, TextInput, TouchableOpacity, View, Pressable, Image } from "react-native";
import { globalStyles } from "../../styles";
import React, { useState, useEffect } from "react";
import { handleSubmitAddEditBoard, handleSubmitAddSet } from "../Apicalls";
import Config from "../../config/config";
import { selectImage } from "../../utils/imageUtils";
import { MaterialIcons } from '@expo/vector-icons';

export default function AddModal({
                                     modalVisible,
                                     setModalVisible,
                                     onDataUpdated,
                                     onBordUpdated = null,
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
    const [addLegoMinifigs, setAddLegoMinifigs] = useState(false);
    const [addLegoImages, setAddLegoImages] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageChanged, setImageChanged] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const togglePublicPrivate = () => setIsPublicPrivate(prev => !prev);
    const toggleParts = () => setAddLegoParts(prev => !prev);
    const toggleImages = () => setAddLegoImages(prev => !prev);
    const toggleMinifigs = () => setAddLegoMinifigs(prev => !prev);

    // Reset or prefill fields whenever modal opens
    useEffect(() => {
        if (!modalVisible) return;

        setErrorMessage(null);

        if (mode === 'edit' && data) {
            setTitle(data.title || '');
            setDescription(data.description || '');
            setIsPublicPrivate(data.isPublic || false);
            setSelectedImage(data.filePath ? Config.API_BASE_URL + data.filePath : null);
            setImageChanged(false);

            setLegoNmbr('');
            setAddLegoParts(false);
            setAddLegoImages(false);
            setAddLegoMinifigs(false);

        } else if (mode === 'addItem') {

            setLegoNmbr('');
            setAddLegoParts(false);
            setAddLegoImages(false);
            setAddLegoMinifigs(false);

            setTitle('');
            setDescription('');
            setIsPublicPrivate(false);
            setSelectedImage(null);

        } else {
            setTitle('');
            setDescription('');
            setIsPublicPrivate(false);
            setSelectedImage(null);

            setLegoNmbr('');
            setAddLegoParts(false);
            setAddLegoImages(false);
            setAddLegoMinifigs(false);
        }

    }, [modalVisible, mode, data]);

    const pickImage = async () => {
        const result = await selectImage();
        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setImageChanged(true);
        }
    };

    const handleSubmit = () => {
        setGlobalLoading(true);
        if (mode === 'add') {
            handleSubmitAddEditBoard(data?.bordId, title, description, isPublicPrivate, selectedImage, setGlobalError, setGlobalLoading, setModalVisible, onDataUpdated, mode);
        } else if (mode === 'addItem') {
            if (!data?.bordId) {
                setErrorMessage('No bord ID provided.');
                setGlobalLoading(false);
                return;
            }
            handleSubmitAddSet(data.bordId, legoNmbr, addLegoImages, addLegoParts, addLegoMinifigs, setGlobalError, setGlobalLoading, setModalVisible, onDataUpdated);
        } else if (mode === 'edit') {
            if (!data?.id) {
                setErrorMessage('No bord ID provided for edit.');
                setGlobalLoading(false);
                return;
            }
            handleSubmitAddEditBoard(data.id, title, description, isPublicPrivate, imageChanged ? selectedImage : null, setGlobalError, setGlobalLoading, setModalVisible, () => {
                onDataUpdated();
                if (onBordUpdated) onBordUpdated({ title, description, isPublic: isPublicPrivate });
            }, mode);
        }
    };

    const getTitleText = () => {
        switch (mode) {
            case 'add': return 'Bord aanmaken';
            case 'addItem': return 'Set toevoegen';
            case 'edit': return 'Bord bewerken';
            default: return 'Bord aanmaken';
        }
    };

    const getButtonText = () => {
        switch (mode) {
            case 'add': return 'Bord toevoegen';
            case 'addItem': return 'Set toevoegen';
            case 'edit': return 'Wijzigingen opslaan';
            default: return 'Opslaan';
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                            <Text style={globalStyles.h1}>{getTitleText()}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={28} color="gray" />
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

                                {/* Switches with icons */}
                                <View style={{ marginTop: 10 }}>
                                    {/* Add image(s) switch */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                                        <MaterialIcons name="image" size={24} color="#555" style={{ marginRight: 8 }} />
                                        <Text style={{ flexShrink: 1, fontWeight: 'bold', fontSize: 16, color: '#000', marginRight: 8 }}>
                                            Add image(s)
                                        </Text>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#349A20FF' }}
                                            thumbColor={addLegoImages ? '#3dd51e' : '#f4f3f4'}
                                            onValueChange={toggleImages}
                                            value={addLegoImages}
                                        />
                                    </View>

                                    {/* Add parts switch */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                                        <MaterialIcons name="construction" size={24} color="#555" style={{ marginRight: 8 }} />
                                        <Text style={{ flexShrink: 1, fontWeight: 'bold', fontSize: 16, color: '#000', marginRight: 8 }}>
                                            Add parts
                                        </Text>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#349A20FF' }}
                                            thumbColor={addLegoParts ? '#3dd51e' : '#f4f3f4'}
                                            onValueChange={toggleParts}
                                            value={addLegoParts}
                                        />
                                    </View>

                                    {/* Add minifigs switch */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                                        <MaterialIcons name="person" size={24} color="#555" style={{ marginRight: 8 }} />
                                        <Text style={{ flexShrink: 1, fontWeight: 'bold', fontSize: 16, color: '#000', marginRight: 8 }}>
                                            Add minifigs
                                        </Text>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#349A20FF' }}
                                            thumbColor={addLegoMinifigs ? '#3dd51e' : '#f4f3f4'}
                                            onValueChange={toggleMinifigs}
                                            value={addLegoMinifigs}
                                        />
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                {/* Image picker */}
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

                                {/* Title input */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                    <TextInput
                                        style={globalStyles.input2}
                                        value={title}
                                        onChangeText={(t) => { if (t.length <= maxLength) setTitle(t); }}
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
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                                <Text style={{ marginRight: 10 }}>
                                    {isPublicPrivate ? 'Public' : 'Prive'}
                                </Text>
                                <Switch
                                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                                    thumbColor={isPublicPrivate ? '#007BFF' : '#f4f3f4'}
                                    onValueChange={togglePublicPrivate}
                                    value={isPublicPrivate}
                                />
                            </View>
                        )}

                        {/* Submit button */}
                        <Pressable style={globalStyles.button} onPress={handleSubmit}>
                            <Text style={globalStyles.text}>{getButtonText()}</Text>
                        </Pressable>

                        {errorMessage && (
                            <Text style={{ color: 'red', marginTop: 10 }}>{errorMessage}</Text>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
