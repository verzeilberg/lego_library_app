import { Modal, Text, Switch, TextInput, TouchableOpacity, View, Pressable, Image } from "react-native";
import { useStyles, useTheme } from "../../styles";
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
    const styles = useStyles();
    const { colors } = useTheme();
    const maxLength = 50;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublicPrivate, setIsPublicPrivate] = useState(false);
    const [legoNmbr, setLegoNmbr] = useState('');
    const [addLegoParts, setAddLegoParts] = useState(true);
    const [addLegoMinifigs, setAddLegoMinifigs] = useState(true);
    const [addLegoImages, setAddLegoImages] = useState(true);

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
            setAddLegoParts(true);
            setAddLegoImages(true);
            setAddLegoMinifigs(true);

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

    }, [modalVisible, mode, data?.id, data?.bordId, data?.title, data?.description, data?.isPublic, data?.filePath]);

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
            case 'edit': return 'Opslaan';
            default: return 'Opslaan';
        }
    };

    return (
        <View style={styles.modalPlaceHolder}>
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                            <Text style={styles.h1}>{getTitleText()}</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.setDetailCloseButton}
                                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {mode === 'addItem' ? (
                            <>
                                {/* Info text above the input */}
                                <Text style={{ marginBottom: 5, fontWeight: 'bold', color: colors.text }}>
                                    Voer het Lego-nummer in:
                                </Text>

                                {/* TextInput for addItem mode */}
                                <TextInput
                                    style={styles.input2}
                                    value={legoNmbr}
                                    onChangeText={(t) => setLegoNmbr(t.replace(/[^0-9]/g, ''))}
                                    placeholder="Lego nummer"
                                    keyboardType="numeric"
                                />

                                {/* Switches with icons */}
                                <View style={{ marginTop: 10 }}>
                                    {/* Add image(s) switch */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialIcons name="image" size={24} color={colors.textSecondary} style={{ marginRight: 8 }} />
                                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>
                                                Add image(s)
                                            </Text>
                                        </View>
                                        <Switch
                                            trackColor={{ false: colors.switchTrack, true: colors.switchTrackOn }}
                                            thumbColor={addLegoImages ? colors.switchActive : colors.switchThumb}
                                            onValueChange={toggleImages}
                                            value={addLegoImages}
                                        />
                                    </View>

                                    {/* Add parts switch */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialIcons name="construction" size={24} color={colors.textSecondary} style={{ marginRight: 8 }} />
                                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>
                                                Add parts
                                            </Text>
                                        </View>
                                        <Switch
                                            trackColor={{ false: colors.switchTrack, true: colors.switchTrackOn }}
                                            thumbColor={addLegoParts ? colors.switchActive : colors.switchThumb}
                                            onValueChange={toggleParts}
                                            value={addLegoParts}
                                        />
                                    </View>

                                    {/* Add minifigs switch */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialIcons name="person" size={24} color={colors.textSecondary} style={{ marginRight: 8 }} />
                                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>
                                                Add minifigs
                                            </Text>
                                        </View>
                                        <Switch
                                            trackColor={{ false: colors.switchTrack, true: colors.switchTrackOn }}
                                            thumbColor={addLegoMinifigs ? colors.switchActive : colors.switchThumb}
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
                                    style={styles.parentImageRectangleContainer}
                                    onPress={pickImage}
                                >
                                    {selectedImage ? (
                                        <Image
                                            source={{ uri: selectedImage }}
                                            style={styles.imageRectangleContainer}
                                            resizeMode="cover"
                                        />
                                    ) : null}
                                </TouchableOpacity>

                                {/* Title input */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                    <TextInput
                                        style={styles.input2}
                                        value={title}
                                        onChangeText={(t) => { if (t.length <= maxLength) setTitle(t); }}
                                        placeholder="Titel"
                                        maxLength={maxLength}
                                    />
                                    <TextInput
                                        style={styles.counter}
                                        value={`${title.length}/${maxLength}`}
                                        editable={false}
                                        pointerEvents="none"
                                    />
                                </View>

                                {/* Description input */}
                                <TextInput
                                    style={styles.textArea}
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
                                <Text style={{ marginRight: 10, color: colors.text }}>
                                    {isPublicPrivate ? 'Public' : 'Prive'}
                                </Text>
                                <Switch
                                    trackColor={{ false: colors.switchTrack, true: colors.switchTrackOn }}
                                    thumbColor={isPublicPrivate ? colors.switchActive : colors.switchThumb}
                                    onValueChange={togglePublicPrivate}
                                    value={isPublicPrivate}
                                />
                            </View>
                        )}

                        {/* Submit button */}
                        <Pressable style={styles.button} onPress={handleSubmit}>
                            <Text style={[styles.text, {color: '#fff'}]}>{getButtonText()}</Text>
                        </Pressable>

                        {errorMessage && (
                            <Text style={{ color: colors.danger, marginTop: 10 }}>{errorMessage}</Text>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
