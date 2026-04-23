import React, {useEffect, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {View, Text, Image, TouchableOpacity, StyleSheet, Pressable, ScrollView, Modal} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Config from "../../config/config";
import {globalStyles} from '../../styles';
import {confirmDelete } from "../../services/profileService";
import {openCameraWithoutUpload, openImageLibraryWithoutUpload} from "../../utils/imageUtils";
import FloatingLabelInput from "../../components/form/FloatingLabelInput";
import {handleSubmitEditProfile, fetchData} from "../../components/Apicalls";
import {ImageOptionsModal} from "../../components/Functions";
import Icon from "react-native-vector-icons/FontAwesome";

const PROFILE_IMAGES = {
    vrouw: require('../../assets/images/minifigure-portrait-female.png'),
    man: require('../../assets/images/minifigure-portrait-male.png'),
    default: require('../../assets/images/minifigure-portrait-gender-neutral.png'),
};

const defaultImageForGeslacht = (geslacht) =>
    PROFILE_IMAGES[geslacht] ?? PROFILE_IMAGES.default;

const ProfileScreen = ({navigation, setGlobalLoading, setGlobalError}) => {
    const [data, setData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);

    // Editable states
    const [userName, setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [geslacht, setGeslacht] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    useFocusEffect(useCallback(() => {
        return () => setIsEditing(false);
    }, []));

    useEffect(() => {
        setGlobalLoading(true);
        fetchData(setData, setGlobalError, setGlobalLoading);
    }, []);

    // When data is loaded, initialize editable fields
    useEffect(() => {
        if (data) {
            setUserName(data.userName);
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setBio(data.bio);
            setGeslacht((data.geslacht || '').trim().toLowerCase());
            setProfilePicture(data.profilePicture ? `${Config.API_BASE_URL}${data.profilePicture}?t=${Date.now()}` : '');
        }
    }, [data]);

    const handleCamera = async () => {
        setShowImageOptions(false);
        const result = await openCameraWithoutUpload();
        if (!result.canceled) setProfilePicture(result.assets[0].uri);
    };

    const handleLibrary = async () => {
        setShowImageOptions(false);
        const result = await openImageLibraryWithoutUpload(true, 0, false);
        if (!result.canceled) setProfilePicture(result.assets[0].uri);
    };

    const handleDeletePicture = () => {
        setShowImageOptions(false);
        setProfilePicture('');
    };

    return (
        <ScrollView contentContainerStyle={[globalStyles.container, { paddingBottom: 60 }]}>
            <View style={globalStyles.container}>
                <TouchableOpacity onPress={() => setShowImagePreview(true)}>
                    <Image
                        source={profilePicture ? {uri: profilePicture} : defaultImageForGeslacht(geslacht)}
                        style={globalStyles.imageRoundContainer}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                {isEditing ? (
                    <TouchableOpacity onPress={() => setShowImageOptions(true)}>
                        <Text style={globalStyles.profileImageEditText}>Bewerk</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Full image preview modal */}
            <Modal visible={showImagePreview && !!profilePicture} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.previewOverlay}
                    activeOpacity={1}
                    onPress={() => setShowImagePreview(false)}
                >
                    {profilePicture ? (
                        <Image
                            source={{uri: profilePicture}}
                            style={styles.previewImage}
                            resizeMode="contain"
                        />
                    ) : null}
                </TouchableOpacity>
            </Modal>

            <ImageOptionsModal
                visible={showImageOptions}
                onClose={() => setShowImageOptions(false)}
                onCamera={handleCamera}
                onLibrary={handleLibrary}
                onDelete={handleDeletePicture}
            />

            {isEditing ? (
                <>
                    <FloatingLabelInput
                        style={globalStyles.floatLabelInput}
                        value={userName}
                        onChangeText={setUserName}
                        placeholder="User Name"
                    />

                    <FloatingLabelInput
                        style={globalStyles.floatLabelInput}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First Name"
                    />

                    <FloatingLabelInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last Name"
                    />

                    <FloatingLabelInput
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Biografie"
                        multiline
                    />

                    <View style={globalStyles.pickerContainer}>
                        <Text style={globalStyles.pickerLabel}>Geslacht</Text>
                        <View style={globalStyles.pickerWrapper}>
                            <Picker
                                selectedValue={geslacht}
                                onValueChange={setGeslacht}
                                style={globalStyles.picker}
                                itemStyle={globalStyles.pickerItem}
                            >
                                <Picker.Item label="Selecteer geslacht" value="" style={globalStyles.pickerItem}/>
                                <Picker.Item label="Man" value="man" style={globalStyles.pickerItem}/>
                                <Picker.Item label="Vrouw" value="vrouw" style={globalStyles.pickerItem}/>
                                <Picker.Item label="Geslacht neutraal" value="geslacht_neutraal" style={globalStyles.pickerItem}/>
                            </Picker>
                        </View>
                    </View>

                    <Pressable
                        style={globalStyles.button}
                        onPress={() => {
                            setGlobalLoading(true);
                            handleSubmitEditProfile(userName, firstName, lastName, bio, geslacht, profilePicture, setGlobalError, setData, setIsEditing, setGlobalLoading, navigation)
                        }}
                    >
                        <Text style={globalStyles.text}>Save</Text>
                    </Pressable>
                </>
            ) : (
                <>
                    <Text style={globalStyles.nameText}>{userName}</Text>
                    <Text style={globalStyles.nameText}>{firstName} {lastName}</Text>
                    <Text style={globalStyles.emailText}>{bio}</Text>
                    {geslacht ? <Text style={globalStyles.emailText}>{geslacht === 'man' ? 'Man' : geslacht === 'vrouw' ? 'Vrouw' : 'Geslacht neutraal'}</Text> : null}

                    <Pressable
                        style={globalStyles.button}
                        onPress={() => setIsEditing(true)}
                    >
                        <View style={globalStyles.inputContainer}>
                            <Text style={globalStyles.text}>Edit</Text>
                            <Icon name='edit' size={20} color="#ffffff"/>
                        </View>
                    </Pressable>
                    <Pressable
                        style={globalStyles.button}
                        onPress={() => confirmDelete(setGlobalLoading, setGlobalError, navigation)}
                    >
                        <View style={globalStyles.inputContainer}>
                            <Text style={globalStyles.text}>Delete</Text>
                            <Icon name='trash' size={20} color="#ffffff"/>
                        </View>
                    </Pressable>

                </>
            )}

            {/* Conditionally render error message */}
            {errorMessage && (
                <Text style={globalStyles.errorText}>{errorMessage}</Text>
            )}
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
});

export default ProfileScreen;
