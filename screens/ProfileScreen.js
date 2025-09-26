import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, Pressable, Alert} from 'react-native';
import Config from "../config/config";
import {globalStyles} from '../styles';
import {fetchData, confirmDelete, selectImage} from "../components/Functions";
import LoadingSpinner from "../components/Elements";
import FloatingLabelInput from "../components/FloatingLabelInput";
import {handleSubmitEditProfile} from "../components/Apicalls";
import Icon from "react-native-vector-icons/FontAwesome";

const ProfileScreen = ({navigation}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const pickImage = async () => {
        const result = await selectImage();
        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
        }
    };
    // Editable states
    const [userName, setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    useEffect(() => {
        fetchData(setData, setError, setLoading);
    }, []);

    // When data is loaded, initialize editable fields
    useEffect(() => {
        if (data) {
            setUserName(data.userName);
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setBio(data.bio);
            setProfilePicture(`${Config.API_BASE_URL + data.profilePicture}?t=${Date.now()}`);
        }
    }, [data]);

    if (loading) {
        return <LoadingSpinner/>;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.container}>
                <TouchableOpacity
                    onPress={() => {
                        if (isEditing) {
                            pickImage();
                        }
                    }}
                >
                    <Image
                        source={profilePicture ? {uri: profilePicture} : {uri: Config.API_BASE_URL}}
                        style={globalStyles.imageRoundContainer}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                {/* Remove Button */}
                {isEditing && profilePicture ? (
                    <TouchableOpacity
                        style={globalStyles.imagePlaceholder}
                        onPress={() => {
                            setProfilePicture('');

                        }}
                    >
                        <Icon name={'close'} size={15}/>
                    </TouchableOpacity>
                ) : null}
            </View>

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


                    <Pressable
                        style={globalStyles.button}
                        onPress={() => {
                            setLoading(true);
                            handleSubmitEditProfile(userName, firstName, lastName, bio, profilePicture, setErrorMessage, setData, setIsEditing, setLoading, navigation)
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
                        onPress={() => confirmDelete(setLoading, navigation)}
                    >
                        <View style={globalStyles.inputContainer}>
                            <Text style={globalStyles.text}>Delete</Text>
                            <Icon name='trash' size={20} color="#ffffff"/>
                        </View>
                    </Pressable>

                </>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        marginVertical: 10,
    },
});
export default ProfileScreen;
