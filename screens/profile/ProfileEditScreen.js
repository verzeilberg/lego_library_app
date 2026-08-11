import React, {useState, useEffect} from 'react';
import {View, Text, Image, TouchableOpacity, Pressable, ScrollView} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Config from '../../config/config';
import {useStyles} from '../../styles';
import {openCameraWithoutUpload, openImageLibraryWithoutUpload} from '../../utils/imageUtils';
import FloatingLabelInput from '../../components/form/FloatingLabelInput';
import {handleSubmitEditProfile} from '../../components/Apicalls';
import ErrorBanner from '../../components/ui/ErrorBanner';

const PROFILE_IMAGES = {
    vrouw: require('../../assets/images/minifigure-portrait-female.png'),
    man: require('../../assets/images/minifigure-portrait-male.png'),
    default: require('../../assets/images/minifigure-portrait-gender-neutral.png'),
};

const defaultImageForGeslacht = (geslacht) =>
    PROFILE_IMAGES[geslacht] ?? PROFILE_IMAGES.default;

const ProfileEditScreen = ({route, navigation, setGlobalLoading, setGlobalError}) => {
    const styles = useStyles();
    const data = route.params?.data;

    const [userName, setUserName] = useState(data?.userName || '');
    const [firstName, setFirstName] = useState(data?.firstName || '');
    const [lastName, setLastName] = useState(data?.lastName || '');
    const [bio, setBio] = useState(data?.bio || '');
    const [geslacht, setGeslacht] = useState((data?.geslacht || '').trim().toLowerCase());
    const [profilePicture, setProfilePicture] = useState(
        data?.profilePicture ? `${Config.API_BASE_URL}${data.profilePicture}?t=${Date.now()}` : ''
    );

    const handleCamera = async () => {
        try {
            const result = await openCameraWithoutUpload();
            if (!result.canceled && result.assets?.length) setProfilePicture(result.assets[0].uri);
        } catch (e) {
            setGlobalError('Camera error: ' + e.message);
        }
    };

    const handleLibrary = async () => {
        try {
            const result = await openImageLibraryWithoutUpload(true, 0, false);
            if (!result.canceled && result.assets?.length) setProfilePicture(result.assets[0].uri);
        } catch (e) {
            setGlobalError('Gallery error: ' + e.message);
        }
    };

    const handleDeletePicture = () => setProfilePicture('');

    useEffect(() => {
        const action = route.params?.imageAction;
        if (!action) return;
        navigation.setParams({imageAction: undefined});
        if (action === 'camera') handleCamera().catch(() => {});
        else if (action === 'library') handleLibrary().catch(() => {});
        else if (action === 'delete') handleDeletePicture();
    }, [route.params?.imageAction]);

    const displayImageSource = profilePicture
        ? {uri: profilePicture}
        : defaultImageForGeslacht(geslacht);

    return (
        <View style={styles.flex1}>
            <ErrorBanner />
            <ScrollView contentContainerStyle={[styles.container, {paddingBottom: 60}]}>
            <View style={styles.container}>
                <Image
                    source={displayImageSource}
                    style={styles.imageRoundContainer}
                    resizeMode="cover"
                />
                <TouchableOpacity onPress={() => navigation.navigate('ProfilePicture', {returnTo: 'ProfileEdit', data})}>
                    <Text style={styles.profileImageEditText}>Bewerk</Text>
                </TouchableOpacity>
            </View>

            <FloatingLabelInput
                style={styles.floatLabelInput}
                value={userName}
                onChangeText={setUserName}
                placeholder="User Name"
            />
            <FloatingLabelInput
                style={styles.floatLabelInput}
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

            <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Geslacht</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={geslacht}
                        onValueChange={setGeslacht}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Selecteer geslacht" value="" style={styles.pickerItem}/>
                        <Picker.Item label="Man" value="man" style={styles.pickerItem}/>
                        <Picker.Item label="Vrouw" value="vrouw" style={styles.pickerItem}/>
                        <Picker.Item label="Geslacht neutraal" value="geslacht_neutraal" style={styles.pickerItem}/>
                    </Picker>
                </View>
            </View>

            <Pressable
                style={styles.button}
                onPress={() => {
                    setGlobalLoading(true);
                    handleSubmitEditProfile(
                        userName, firstName, lastName, bio, geslacht, profilePicture,
                        setGlobalError,
                        () => {},
                        () => navigation.popToTop(),
                        setGlobalLoading,
                        navigation
                    );
                }}
            >
                <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            </ScrollView>
        </View>
    );
};

export default ProfileEditScreen;
