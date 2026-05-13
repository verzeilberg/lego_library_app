import React from 'react';
import {ScrollView, Text, TouchableOpacity} from 'react-native';
import {globalStyles} from '../../styles';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfilePictureScreen = ({route, navigation}) => {
    const returnTo = route.params?.returnTo ?? 'ProfileScreen';

    const handle = (action) => {
        navigation.navigate(returnTo, {imageAction: action});
    };

    return (
        <ScrollView contentContainerStyle={globalStyles.container}>
            <Text style={globalStyles.settingsSectionTitle}>Profielfoto</Text>
            <TouchableOpacity style={globalStyles.settingsRow} onPress={() => handle('camera')}>
                <Text style={globalStyles.settingsLabel}>Camera</Text>
                <Icon name="camera" size={16} color="#444"/>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.settingsRow} onPress={() => handle('library')}>
                <Text style={globalStyles.settingsLabel}>Bibliotheek</Text>
                <Icon name="image" size={16} color="#444"/>
            </TouchableOpacity>
            <TouchableOpacity style={globalStyles.settingsRow} onPress={() => handle('delete')}>
                <Text style={[globalStyles.settingsLabel, globalStyles.settingsDeleteLabel]}>Verwijder foto</Text>
                <Icon name="trash" size={16} color="#dc3545"/>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default ProfilePictureScreen;
