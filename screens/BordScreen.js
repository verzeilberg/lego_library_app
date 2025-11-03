import {View, Text, Image, TouchableOpacity, ScrollView} from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { globalStyles } from '../styles';
import Config from '../config/config';
import { handleSubmitDeleteBord, reloadData } from "../components/Apicalls";
import AddModal from '../components/AddModal';

export default function BordScreen({ route, navigation, setGlobalError, setGlobalLoading }) {
    const { item } = route.params;
    const [bord, setBord] = useState(item);

    // Modal state for add/edit
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'addItem', 'edit'

    // Data to prefill modal when editing
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
    }, []);

    const handleAddBord = () => {
        setModalMode('add');
        setModalData(null);
        setModalVisible(true);
    };

    const handleAddItem = () => {
        setModalMode('addItem');
        setModalData({ bordId: bord.id });
        setModalVisible(true);
    };

    const handleEditBord = () => {
        setModalMode('edit');
        setModalData(bord); // prefill with current bord
        setModalVisible(true);
    };

    return (

        <ScrollView style={{ flex: 1, padding: 16 }}>
            {/* Top buttons row */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16
            }}>
                {/* Left: Add buttons */}
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={handleAddBord} style={{ marginRight: 16 }}>
                        <MaterialIcons name="playlist-add" size={28} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddItem}>
                        <MaterialIcons name="post-add" size={28} color="blue" />
                    </TouchableOpacity>
                </View>

                {/* Right: Edit button */}
                <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={handleEditBord}>
                    <MaterialIcons name="edit" size={28} color="orange" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={async () => {
                        handleSubmitDeleteBord(bord.id, setGlobalLoading, navigation, setGlobalError)
                    }}
                >
                    <MaterialIcons name="delete" size={28} color="red" />
                </TouchableOpacity>
                </View>
            </View>

            {/* Image */}
            {bord.filePath && (
                <Image
                    source={{ uri: Config.API_BASE_URL + bord.filePath }}
                    style={{ width: '100%', height: 200, borderRadius: 12 }}
                    resizeMode="cover"
                />
            )}

            {/* Title and Description */}
            <Text style={[globalStyles.titleText, { marginTop: 16 }]}>{bord.title}</Text>
            <Text style={[globalStyles.descriptionText, { marginTop: 8 }]}>{bord.description}</Text>

            {/* Modal for Add/Edit */}
            <AddModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                onDataUpdated={() => reloadData(bord.id, setLoading, setBord, setGlobalError)}
                setGlobalError={setGlobalError}
                setGlobalLoading={setGlobalLoading}
                mode={modalMode}
                data={modalData}
            />
        </ScrollView>
    );
}
