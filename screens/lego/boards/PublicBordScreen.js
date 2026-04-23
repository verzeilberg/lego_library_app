import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, TextInput, Keyboard } from 'react-native';
import React, {useCallback, useState} from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { globalStyles } from '../../../styles';
import Config from '../../../config/config';
import { reloadData as reloadBordData } from "../../../components/Apicalls";
import {useFocusEffect} from "@react-navigation/native";

export default function PublicBordScreen({ route, navigation, setGlobalError, setGlobalLoading }) {
    const { item } = route.params;
    const [bord, setBord] = useState(item);

    const [viewType, setViewType] = useState('list'); // 'list' or 'grid'
    const [items, setItems] = useState([]); // Items inside the bord
    const [isLoading, setIsLoading] = useState(true);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const screenWidth = Dimensions.get('window').width;
    const cardMargin = 16;
    const gridSpacing = 8;
    const numColumns = viewType === 'grid' ? 2 : 1;
    const cardWidth = (screenWidth - cardMargin * 2 - gridSpacing * (numColumns - 1)) / numColumns;

    const scaleText = (baseSize) => Math.max(12, Math.min(baseSize, cardWidth / 10));

    useFocusEffect(
        useCallback(() => {
            reloadItems();
        }, [])
    );

    const reloadItems = (query = '') => {
        setIsLoading(true);
        reloadBordData(bord.id, setGlobalLoading, (data) => { setItems(data); setIsLoading(false); }, setGlobalError, query);
    };

    const handleSearch = () => {
        Keyboard.dismiss();
        reloadItems(searchQuery);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                globalStyles.card,
                viewType === 'grid' && { flex: 1, margin: gridSpacing }
            ]}
            onPress={() => {
                if (item.isSet) {
                    navigation.navigate('PublicSetDetail', { item, bordId: bord.id });
                } else {
                    navigation.push('PublicBord', { item });
                }
            }}
            activeOpacity={0.8}
        >
            {item.filePath && (
                <Image
                    source={{ uri: Config.API_BASE_URL + item.filePath }}
                    style={globalStyles.modelListImage}
                />
            )}

            <Text style={[globalStyles.titleText, { fontSize: scaleText(16) }]}>
                {item.isSet ? `${item.id} ${item.title}` : item.title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, padding: 16 }}>
            {/* Bord image */}
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

            {/* View toggle */}
            <View style={[globalStyles.homeToggleBar, {paddingHorizontal: 0}]}>
                <TouchableOpacity onPress={() => { setSearchVisible(v => { if (v) reloadItems(''); return !v; }); setSearchQuery(''); }}>
                    <FontAwesome name="search" size={22} color={searchVisible ? 'blue' : 'gray'} />
                </TouchableOpacity>
                <View style={globalStyles.homeToggleRight}>
                    <TouchableOpacity onPress={() => setViewType('list')} style={globalStyles.homeToggleListButton}>
                        <FontAwesome name="list" size={24} color={viewType === 'list' ? 'blue' : 'gray'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewType('grid')}>
                        <FontAwesome name="th-large" size={24} color={viewType === 'grid' ? 'blue' : 'gray'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Input */}
            {searchVisible && (
                <View style={[globalStyles.homeSearchRow, {marginHorizontal: 0}]}>
                    <TextInput
                        style={globalStyles.homeSearchInput}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity style={globalStyles.homeSearchButton} onPress={handleSearch}>
                        <FontAwesome name="chevron-right" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* FlatList for items */}
            <FlatList
                data={items}
                key={viewType}
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
        </View>
    );
}