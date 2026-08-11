import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useStyles} from '../../styles';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfilePictureScreen = ({route, navigation}) => {
    const styles = useStyles();
    const returnTo = route.params?.returnTo ?? 'ProfileScreen';
    const data = route.params?.data;

    const handle = (action) => {
        navigation.goBack();
        setTimeout(() => {
            navigation.navigate(returnTo, {imageAction: action, data});
        }, 100);
    };

    return (
        <View style={styles.profilePictureOverlay}>
            <View style={styles.profilePictureDismissArea} />
            <View style={styles.profilePictureSheet}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 12}}>
                    <Text style={[styles.settingsSectionTitle, {marginBottom: 0, borderBottomWidth: 0, flex: 1}]}>Profielfoto</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                        <Icon name="times" size={22} color="#999"/>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.settingsRow} onPress={() => handle('camera')}>
                    <Text style={styles.settingsLabel}>Camera</Text>
                    <Icon name="camera" size={16} color="#444"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsRow} onPress={() => handle('library')}>
                    <Text style={styles.settingsLabel}>Bibliotheek</Text>
                    <Icon name="image" size={16} color="#444"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsRow} onPress={() => handle('delete')}>
                    <Text style={[styles.settingsLabel, styles.settingsDeleteLabel]}>Verwijder foto</Text>
                    <Icon name="trash" size={16} color="#dc3545"/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProfilePictureScreen;
