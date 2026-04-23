import {View, Text, Image, FlatList, TouchableOpacity, Dimensions} from "react-native";
import React, {useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {globalStyles} from "../../../styles";
import { fetchModelLists} from "../../../components/Apicalls";
import Config from "../../../config/config";
import AddModal from "../../../components/modals/AddModal";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function BordenScreen({navigation, setGlobalError, setGlobalLoading}) {
    const [data, setData] = useState(null); // To store the fetched data
    const [viewType, setViewType] = useState('list'); // 'list' or 'grid'
    const [modalVisible, setModalVisible] = useState(false);

    //Card dimension
    const screenWidth = Dimensions.get('window').width;
    const cardMargin = 16; // margin/padding from globalStyles
    const gridSpacing = 8;  // space between grid cards
    const numColumns = viewType === 'grid' ? 2 : 1;
    const cardWidth = (screenWidth - cardMargin * 2 - gridSpacing * (numColumns - 1)) / numColumns;
    //Card text dimension
    const scaleText = (baseSize) => Math.max(12, Math.min(baseSize, cardWidth / 10));

    const reloadData = () => {
        setGlobalLoading(true);
        fetchModelLists((result) => {
            setData(Array.isArray(result)
                ? [...new Map(result.map(item => [item.id, item])).values()]
                : result);
        }, setGlobalError, setGlobalLoading);
    };

    useFocusEffect(useCallback(() => {
        reloadData();
    }, []));

const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                globalStyles.card,
                viewType === 'grid' && { flex: 1, margin: gridSpacing }
            ]}
            onPress={() => navigation.navigate('Bord', { item })}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: Config.API_BASE_URL + item.filePath }}
                style={globalStyles.modelListImage}
            />
            <Text style={[
                globalStyles.titleText,
                { fontSize: scaleText(16) } // dynamically scaled
            ]}>
                {item.title}
            </Text>
            <Text style={[
                globalStyles.descriptionText,
                { fontSize: scaleText(14) } // dynamically scaled
            ]}>
                {item.description}
            </Text>
        </TouchableOpacity>
    );




    return (
        <View style={globalStyles.flex1}>
            {/* Toggle Buttons */}
            <View style={globalStyles.homeToggleBar}>
                <View style={globalStyles.homeToggleRight}>
                    <TouchableOpacity onPress={() => setViewType('list')} style={globalStyles.homeToggleListButton}>
                        <FontAwesome
                            name="list"
                            size={24}
                            color={viewType === 'list' ? 'blue' : 'gray'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewType('grid')}>
                        <FontAwesome
                            name="th-large"
                            size={24}
                            color={viewType === 'grid' ? 'blue' : 'gray'}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={{padding: 6}}>
                    <MaterialIcons name="playlist-add" size={28} color="green" />
                </TouchableOpacity>
            </View>

            {/* Item List / Grid */}
            <FlatList
                data={data}
                key={viewType} // forces re-render on toggle
                keyExtractor={(item) => item.id.toString()}
                numColumns={viewType === 'grid' ? 2 : 1}
                contentContainerStyle={globalStyles.listContainer}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                    <View>
                        <Text style={globalStyles.titleText}>No data available</Text>
                    </View>
                )}
            />

            <AddModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                onDataUpdated={reloadData}
                setGlobalError={setGlobalError}
                setGlobalLoading={setGlobalLoading}
            />
        </View>
    );

}
