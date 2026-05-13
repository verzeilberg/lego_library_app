import React, {useState, useEffect} from 'react';
import {View, Text, Image, TouchableOpacity, Pressable, ScrollView} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Config from '../../config/config';
import {globalStyles} from '../../styles';
import {openCameraWithoutUpload, openImageLibraryWithoutUpload} from '../../utils/imageUtils';
import FloatingLabelInput from '../../components/form/FloatingLabelInput';
import {handleSubmitEditProfile} from '../../components/Apicalls';

const PROFILE_IMAGES = {
    vrouw: require('../../assets/images/minifigure-portrait-female.png'),
    man: require('../../assets/images/minifigure-portrait-male.png'),
    default: require('../../assets/images/minifigure-portrait-gender-neutral.png'),
};

const defaultImageForGeslacht = (geslacht) =>
    PROFILE_IMAGES[geslacht] ?? PROFILE_IMAGES.default;

const ProfileEditScreen = ({route, navigation, setGlobalLoading, setGlobalError}) => {
    const {data} = route.params;

    const [userName, setUserName] = useState(data.userName || '');
    const [firstName, setFirstName] = useState(data.firstName || '');
    const [lastName, setLastName] = useState(data.lastName || '');
    const [bio, setBio] = useState(data.bio || '');
    const [geslacht, setGeslacht] = useState((data.geslacht || '').trim().toLowerCase());
    const [profilePicture, setProfilePicture] = useState(
        data.profilePicture ? `${Config.API_BASE_URL}${data.profilePicture}?t=${Date.now()}` : ''
    );

    const handleCamera = async () => {
        const result = await openCameraWithoutUpload();
        if (!result.canceled) setProfilePicture(result.assets[0].uri);
    };

    const handleLibrary = async () => {
        const result = await openImageLibraryWithoutUpload(true, 0, false);
        if (!result.canceled) setProfilePicture(result.assets[0].uri);
    };

    const handleDeletePicture = () => setProfilePicture('');

    useEffect(() => {
        const action = route.params?.imageAction;
        if (!action) return;
        navigation.setParams({imageAction: undefined});
        if (action === 'camera') handleCamera();
        else if (action === 'library') handleLibrary();
        else if (action === 'delete') handleDeletePicture();
    }, [route.params?.imageAction]);

    const displayImageSource = profilePicture
        ? {uri: profilePicture}
        : defaultImageForGeslacht(geslacht);

    return (
        <ScrollView contentContainerStyle={[globalStyles.container, {paddingBottom: 60}]}>
            <View style={globalStyles.container}>
                <Image
                    source={displayImageSource}
                    style={globalStyles.imageRoundContainer}
                    resizeMode="cover"
                />
                <TouchableOpacity onPress={() => navigation.navigate('ProfilePicture', {returnTo: 'ProfileEdit'})}>
                    <Text style={globalStyles.profileImageEditText}>Bewerk</Text>
                </TouchableOpacity>
            </View>

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
                    handleSubmitEditProfile(
                        userName, firstName, lastName, bio, geslacht, profilePicture,
                        setGlobalError,
                        () => {},
                        () => navigation.goBack(),
                        setGlobalLoading,
                        navigation
                    );
                }}
            >
                <Text style={globalStyles.text}>Save</Text>
            </Pressable>
        </ScrollView>
    );
};

export default ProfileEditScreen;
