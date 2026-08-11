import React, {useState, useCallback, useLayoutEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {View, Text, Image, TouchableOpacity, ScrollView, Modal} from 'react-native';
import Config from '../../config/config';
import {useStyles} from '../../styles';
import {fetchData} from '../../components/Apicalls';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ErrorBanner from '../../components/ui/ErrorBanner';

const PROFILE_IMAGES = {
    vrouw: require('../../assets/images/minifigure-portrait-female.png'),
    man: require('../../assets/images/minifigure-portrait-male.png'),
    default: require('../../assets/images/minifigure-portrait-gender-neutral.png'),
};

const defaultImageForGeslacht = (geslacht) =>
    PROFILE_IMAGES[geslacht] ?? PROFILE_IMAGES.default;

const ProfileScreen = ({navigation, setGlobalLoading, setGlobalError}) => {
    const styles = useStyles();
    const [data, setData] = useState(null);
    const [showImagePreview, setShowImagePreview] = useState(false);

    useFocusEffect(useCallback(() => {
        setGlobalLoading(true);
        fetchData(setData, setGlobalError, setGlobalLoading);
    }, []));

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 4}}>
                    <TouchableOpacity onPress={() => data && navigation.navigate('ProfileEdit', {data})}>
                        <Icon name="edit" size={22} color="#fff"/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ProfileConfig')}>
                        <Ionicons name="settings-outline" size={24} color="#fff"/>
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, data]);

    if (!data) return null;

    const geslacht = (data.geslacht || '').trim().toLowerCase();
    const profilePicture = data.profilePicture ? `${Config.API_BASE_URL}${data.profilePicture}` : '';
    const displayImageSource = profilePicture ? {uri: profilePicture} : defaultImageForGeslacht(geslacht);
    const geslachtLabel =
        geslacht === 'man' ? 'Man' :
        geslacht === 'vrouw' ? 'Vrouw' :
        geslacht ? 'Geslacht neutraal' : null;

    return (
        <View style={styles.flex1}>
            <ErrorBanner />
            <ScrollView contentContainerStyle={[styles.container, {paddingBottom: 60}]}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => profilePicture && setShowImagePreview(true)}>
                    <Image
                        source={displayImageSource}
                        style={styles.imageRoundContainer}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View>

            <Modal visible={showImagePreview && !!profilePicture} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.imagePreviewOverlay}
                    activeOpacity={1}
                    onPress={() => setShowImagePreview(false)}
                >
                    <Image source={{uri: profilePicture}} style={styles.imagePreviewImage} resizeMode="contain"/>
                </TouchableOpacity>
            </Modal>

            <Text style={styles.nameText}>{data.userName}</Text>
            <Text style={styles.nameText}>{data.firstName} {data.lastName}</Text>
            {data.bio ? <Text style={styles.emailText}>{data.bio}</Text> : null}
            {geslachtLabel ? <Text style={styles.emailText}>{geslachtLabel}</Text> : null}
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;
