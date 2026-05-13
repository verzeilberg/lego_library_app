import { View, Text, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import React, {useCallback, useState} from 'react';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { globalStyles } from '../../../styles';
import Config from '../../../config/config';
import AddModal from '../../../components/modals/AddModal';
import { handleSubmitDeleteBord, reloadData as reloadBordData, fetchSetListById } from "../../../components/Apicalls";
import {useFocusEffect} from "@react-navigation/native";

export default function BordScreen({ route, navigation, setGlobalError, setGlobalLoading }) {
    const { item } = route.params;
    const [bord, setBord] = useState(item);

    const [viewType, setViewType] = useState('list'); // 'list' or 'grid'
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'addItem', 'edit'
    const [modalData, setModalData] = useState(null);
    const [items, setItems] = useState([]); // Items inside the bord
    const [isLoading, setIsLoading] = useState(true);

    const screenWidth = Dimensions.get('window').width;
    const cardMargin = 16;
    const gridSpacing = 8;
    const numColumns = viewType === 'grid' ? 2 : 1;
    const cardWidth = (screenWidth - cardMargin * 2 - gridSpacing * (numColumns - 1)) / numColumns;

    const scaleText = useCallback((baseSize) => Math.max(12, Math.min(baseSize, cardWidth / 10)), [cardWidth]);

    useFocusEffect(
        useCallback(() => {
            reloadItems();
        }, [])
    );

    const reloadItems = () => {
        setIsLoading(true);
        reloadBordData(bord.id, setGlobalLoading, (data) => { setItems(data); setIsLoading(false); }, setGlobalError);
    };

    const handleAddBord = () => {
        setModalMode('add');
        setModalData({ bordId: bord.id });
        setModalVisible(true);
    };

    const handleAddItem = () => {
        setModalMode('addItem');
        setModalData({ bordId: bord.id });
        setModalVisible(true);
    };

    const handleEditBord = () => {
        setModalMode('edit');
        setModalData(bord);
        setModalVisible(true);
    };

    const renderItem = useCallback(({ item }) => (
        <TouchableOpacity
            style={[globalStyles.card, viewType === 'grid' && {flex: 1, margin: gridSpacing}]}
            onPress={() => {
                if (item.isSet) {
                    navigation.navigate('SetDetail', {item, bordId: bord.id});
                } else {
                    navigation.push('Bord', {item});
                }
            }}
            activeOpacity={0.8}
        >
            {item.filePath && (
                <Image
                    source={{uri: Config.API_BASE_URL + item.filePath}}
                    style={globalStyles.modelListImage}
                />
            )}
            <Text style={[globalStyles.titleText, {fontSize: scaleText(16)}]}>
                {item.isSet ? `${item.id} ${item.title}` : item.title}
            </Text>
        </TouchableOpacity>
    ), [viewType, gridSpacing, navigation, bord.id, scaleText]);

    return (
        <View style={globalStyles.screenPadding}>
            {/* Top buttons row */}
            <View style={globalStyles.bordActionRow}>
                <View style={globalStyles.bordActionGroup}>
                    <TouchableOpacity onPress={handleAddBord}>
                        <MaterialIcons name="playlist-add" size={28} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddItem}>
                        <MaterialIcons name="post-add" size={28} color="blue" />
                    </TouchableOpacity>
                </View>
                <View style={globalStyles.bordActionGroup}>
                    <TouchableOpacity onPress={handleEditBord}>
                        <MaterialIcons name="edit" size={28} color="orange" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSubmitDeleteBord(bord.id, setGlobalLoading, navigation, setGlobalError)}>
                        <MaterialIcons name="delete" size={28} color="red" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bord image */}
            {bord.filePath && (
                <Image
                    source={{ uri: Config.API_BASE_URL + bord.filePath }}
                    style={globalStyles.bordHeaderImage}
                    resizeMode="cover"
                />
            )}

            {/* Title and Description */}
            <Text style={[globalStyles.titleText, { marginTop: 16 }]}>{bord.title}</Text>
            <Text style={[globalStyles.descriptionText, { marginTop: 8 }]}>{bord.description}</Text>

            {/* View toggle */}
            <View style={globalStyles.listViewToggle}>
                <TouchableOpacity onPress={() => setViewType('list')} style={globalStyles.homeToggleListButton}>
                    <FontAwesome name="list" size={22} color={viewType === 'list' ? 'blue' : 'gray'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewType('grid')}>
                    <FontAwesome name="th-large" size={22} color={viewType === 'grid' ? 'blue' : 'gray'} />
                </TouchableOpacity>
            </View>

            {/* FlatList for items */}
            <FlatList
                data={items}
                key={viewType} // force re-render when toggling
                keyExtractor={(item) => `${item.isSet ? 'set-' : 'item-'}${item.id}`}
                numColumns={numColumns}
                contentContainerStyle={globalStyles.listContainer}
                renderItem={renderItem}
                ListEmptyComponent={() => !isLoading ? (
                    <View>
                        <Text style={globalStyles.titleText}>No sets/list available</Text>
                    </View>
                ) : null}
            />

            {/* Modal */}
            <AddModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                onDataUpdated={reloadItems}
                onBordUpdated={async () => {
                    const updated = await fetchSetListById(bord.id, setGlobalError);
                    if (updated) setBord(updated);
                }}
                setGlobalError={setGlobalError}
                setGlobalLoading={setGlobalLoading}
                mode={modalMode}
                data={modalData}
            />
        </View>
    );
}
