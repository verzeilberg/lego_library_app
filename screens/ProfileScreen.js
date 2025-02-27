import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, Image, Platform, Alert, Button, TouchableOpacity} from 'react-native';
import Config from "../config/config";
import {globalStyles} from '../styles';
import {selectAndUploadImage, fetchData} from "../components/Functions";
import LoadingSpinner from "../components/Elements";


const ProfileScreen = ({navigation}) => {
    const [data, setData] = useState(null); // To store the fetched data
    const [loading, setLoading] = useState(true); // To show loading spinner
    const [error, setError] = useState(null); // To handle errors
    const [uploading, setUploading] = useState(false);
    const [imageUri, setImageUri] = useState(null);

    /**
     *
     */
    useEffect(() => {
        fetchData(setData, setError, setLoading);
    }, []); // Empty dependency array ensures this only runs on component load

    //If loading show spinner
    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.container}>
                <TouchableOpacity  onPress={() => selectAndUploadImage(setImageUri)}>
                {<Image source={{ uri: Config.API_BASE_URL + data.profilePicture }} style={globalStyles.imageContainer}  />}
                </TouchableOpacity>
            </View>
            <Text style={globalStyles.nameText}>{data.userName}</Text>
            <Text style={globalStyles.nameText}>{data.firstName} {data.lastName}</Text>
            <Text style={globalStyles.emailText}>{data.email}</Text>
            <Text style={globalStyles.emailText}>{data.bio}</Text>
        </View>
    );

};

export default ProfileScreen;
