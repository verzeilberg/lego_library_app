import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, Platform, Alert, Button, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Config from "../config/config";
import { globalStyles } from '../styles';

const ProfileScreen = ({navigation}) => {
    const [data, setData] = useState(null); // To store the fetched data
    const [loading, setLoading] = useState(true); // To show loading spinner
    const [error, setError] = useState(null); // To handle errors
    const [image, setImage] = useState(null);


    // Request permissions when the component mounts
    const requestPermission = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    };

    // Run requestPermission once on component mount
    React.useEffect(() => {
        requestPermission();
    }, []);

    // Function to open image picker
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            uploadImage();
        }
    };

    // Function to upload the image
    const uploadImage = async () => {
        if (!image) {
            Alert.alert("Please select an image first");
            return;
        }

        let formData = new FormData();
        formData.append('file', {
            uri: image,
            name: 'photo.jpg',
            type: 'image/png'
        });

        try {
            const apiUrl = Config.API_BASE_URL+'/api/user/1/media_objects';
            const jwtToken = await AsyncStorage.getItem('token');
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': 'Bearer '+jwtToken,
                    "Content-Type": "multipart/form-data",
                },
            });

            const result = await response.json();


            console.log(response);
            console.log('ik ben hier');

            if (response.ok) {
                Alert.alert("Upload Success", "Image uploaded successfully");
            } else {
                console.log(result);
                Alert.alert("Upload Failed", result.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Upload error: ", error);
            Alert.alert("Upload Error", "Could not upload the image");
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            const jwtToken = await AsyncStorage.getItem('token');
            const apiUrl = Config.API_BASE_URL+'/api/user-data/1';
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer '+jwtToken,
                    },
                });
                if (!response.ok) {

                    console.error(response);

                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                setError(error.message || 'Something went wrong!');
            } finally {
                setLoading(false); // Stop loading after the fetch is complete
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures this only runs on component load

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <View style={globalStyles.container}>
                <View>
                    <Image source={{ uri: image }} style={globalStyles.profileImage} />
                    <TouchableOpacity style={globalStyles.editButton} onPress={pickImage}>
                        <Icon name="cloud-upload" size={30} color="#fff" />
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
