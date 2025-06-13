import {Modal, Text, Switch, TextInput, TouchableOpacity, View, Pressable} from "react-native";
import {globalStyles} from "../styles";
import React, {useState} from "react";
import {checkPassword} from "./Functions";
import {handleSubmitAddBoard, handleSubmitRegistration} from "./Apicalls";

export default function AddModal() {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const maxLength = 50;
    const [description, setDescription] = useState('');
    const isMaxReached = name.length >= maxLength;
    const [isPublicPrivate, setIsPublicPrivate] = useState(false);
    const toggleSwitch = () => setIsPublicPrivate(previousState => !previousState);
    const [errorMessage, setErrorMessage] = useState(null);



    const [email, setEmail] = useState('');

    return (
        <View style={globalStyles.modalPlaceHolder}>

            <TouchableOpacity style={globalStyles.openModalButton} onPress={() => setModalVisible(true)}>
                <Text style={globalStyles.openModalButtonText}>+</Text>
            </TouchableOpacity>

            {/* Modal popup */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={globalStyles.modalBackground}>
                    <View style={globalStyles.modalContainer}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <View style={{flex: 1, alignItems: 'center'}}>
                                <Text style={globalStyles.h1}>Bord aanmaken</Text>
                            </View>
                            <TouchableOpacity style={globalStyles.modalCloseButton}
                                              onPress={() => setModalVisible(false)}>
                                <Text style={globalStyles.buttonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 10, width: '100%'}}>
                            <TextInput
                                style={globalStyles.input2}
                                value={name}
                                onChangeText={(t) => {
                                    if (t.length <= maxLength) {
                                        setName(t);
                                    }
                                }}
                                placeholder="Naam"
                                multiline={false}
                                maxLength={maxLength}
                            />
                            {/* Overlay de teller op de TextInput */}
                            <TextInput
                                style={globalStyles.counter}
                                value={`${name.length}/${maxLength}`}
                                editable={false}
                                pointerEvents="none"
                            />
                        </View>

                        <TextInput
                            style={globalStyles.textArea}
                            multiline
                            numberOfLines={4}
                            placeholder="Omschrijving"
                            textAlignVertical="top"
                            value={description}
                        />
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{marginRight: 10}}>
                                {isPublicPrivate ? 'Public' : 'Prive'}
                            </Text>
                            <Switch
                                trackColor={{false: '#767577', true: '#81b0ff'}}
                                thumbColor={isPublicPrivate ? '#007BFF' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isPublicPrivate}
                            />
                        </View>

                        <Pressable
                            style={globalStyles.button}
                            onPress={() => {
                                    handleSubmitAddBoard(name, description, isPublicPrivate, setErrorMessage, navigation);
                            }}
                        >
                            <Text style={globalStyles.text}>Bord toevoegen</Text>
                        </Pressable>

                    </View>
                </View>
            </Modal>
        </View>
    );
}
