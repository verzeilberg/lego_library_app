import {View, Text, Image, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Animated, TextInput, Keyboard} from "react-native";
import React, {useCallback, useState, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {globalStyles} from "../../styles";
import { fetchPublicSetLists } from "../../components/Apicalls";
import Config from "../../config/config";
import { FontAwesome } from '@expo/vector-icons';

const PROFILE_IMAGES = {
    vrouw: require('../../assets/images/minifigure-portrait-female.png'),
    man: require('../../assets/images/minifigure-portrait-male.png'),
    default: require('../../assets/images/minifigure-portrait-gender-neutral.png'),
};

const ownerAvatar = (owner) => {
    if (owner?.profilePicture) {
        const pic = owner.profilePicture;
        const uri = pic.startsWith('http') ? pic : `${Config.API_BASE_URL}${pic}`;
        return {uri};
    }
    const g = (owner?.geslacht || '').trim().toLowerCase();
    return PROFILE_IMAGES[g] ?? PROFILE_IMAGES.default;
};

const PAGE_SIZE = 10;

export default function HomeScreen({navigation, setGlobalError, setGlobalLoading}) {
    const [data, setData] = useState([]);
    const [viewType, setViewType] = useState('card'); // 'card', 'list' or 'grid'
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState('');
    const isFirstLoad = useRef(true);
    const flatListRef = useRef(null);

    //Card dimension
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const cardMargin = 16;
    const gridSpacing = 8;
    const numColumns = viewType === 'grid' ? 2 : 1;
    const cardWidth = (screenWidth - cardMargin * 2 - gridSpacing * (numColumns - 1)) / numColumns;

    const scaleText = (baseSize) => Math.max(12, Math.min(baseSize, cardWidth / 10));

    const loadPage = (pageToLoad, replace = false, query = '') => {
        if (replace) {
            setGlobalLoading(true);
        } else {
            setLoadingMore(true);
        }

        fetchPublicSetLists(
            (result) => {
                const items = Array.isArray(result) ? result : [];
                if (replace) {
                    setData(items);
                } else {
                    setData(prev => {
                        const ids = new Set(prev.map(i => i.id));
                        return [...prev, ...items.filter(i => !ids.has(i.id))];
                    });
                }
                setHasMore(items.length === PAGE_SIZE);
            },
            setGlobalError,
            replace ? setGlobalLoading : setLoadingMore,
            pageToLoad,
            PAGE_SIZE,
            query
        );
    };

    useFocusEffect(
        useCallback(() => {
            setPage(1);
            setHasMore(true);
            loadPage(1, true, '');
        }, [])
    );

    const handleSearch = () => {
        Keyboard.dismiss();
        const q = searchQuery.trim();
        setActiveQuery(q);
        setPage(1);
        setHasMore(!q);
        loadPage(1, true, q);
    };

    const handleEndReached = () => {
        if (loadingMore || !hasMore || activeQuery) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadPage(nextPage, false, '');
    };

    const renderItem = ({ item }) => {
        if (viewType === 'list') {
            return (
                <TouchableOpacity
                    style={globalStyles.homeListCard}
                    onPress={() => navigation.navigate('PublicBord', { item })}
                    activeOpacity={0.8}
                >
                    <Image
                        source={{ uri: Config.API_BASE_URL + item.filePath }}
                        style={globalStyles.homeListThumb}
                    />
                    <View style={globalStyles.homeListInfo}>
                        <Text style={globalStyles.homeListTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={globalStyles.homeListDesc} numberOfLines={2}>{item.description}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            if (item.owner?.id != null) {
                                navigation.navigate('PublicProfile', { userId: item.owner.id });
                            }
                        }}
                        activeOpacity={item.owner?.id != null ? 0.7 : 1}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Image source={ownerAvatar(item.owner)} style={globalStyles.homeListAvatar} />
                    </TouchableOpacity>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={[
                    globalStyles.card,
                    viewType === 'grid' && globalStyles.homeCardGrid,
                ]}
                onPress={() => navigation.navigate('PublicBord', { item })}
                activeOpacity={0.8}
            >
                <Image
                    source={{ uri: Config.API_BASE_URL + item.filePath }}
                    style={globalStyles.modelListImage}
                />
                <View style={globalStyles.homeCardBody}>
                    <View style={globalStyles.homeCardText}>
                        <Text style={[globalStyles.titleText, globalStyles.homeCardTitleText, { fontSize: scaleText(16) }]}>
                            {item.title}
                        </Text>
                        <Text style={[globalStyles.descriptionText, globalStyles.homeCardDescText, { fontSize: scaleText(14) }]}>
                            {item.description}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={globalStyles.homeOwnerButton}
                        onPress={() => {
                            if (item.owner?.id != null) {
                                navigation.navigate('PublicProfile', { userId: item.owner.id });
                            }
                        }}
                        activeOpacity={item.owner?.id != null ? 0.7 : 1}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Image
                            source={ownerAvatar(item.owner)}
                            style={globalStyles.homeOwnerAvatar}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };



    const handleScroll = (event) => {
        setShowScrollTop(event.nativeEvent.contentOffset.y > 100);
    };

    return (
        <View style={globalStyles.homeScreenContainer}>
            {/* Toggle Buttons */}
            <View style={globalStyles.homeToggleBar}>
                <TouchableOpacity onPress={() => { setSearchVisible(v => !v); setSearchQuery(''); }}>
                    <FontAwesome
                        name="search"
                        size={22}
                        color={searchVisible ? 'blue' : 'gray'}
                    />
                </TouchableOpacity>
                <View style={globalStyles.homeToggleRight}>
                    <TouchableOpacity onPress={() => setViewType('card')} style={globalStyles.homeToggleListButton}>
                        <FontAwesome
                            name="square"
                            size={22}
                            color={viewType === 'card' ? 'blue' : 'gray'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewType('list')} style={globalStyles.homeToggleListButton}>
                        <FontAwesome
                            name="list"
                            size={22}
                            color={viewType === 'list' ? 'blue' : 'gray'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewType('grid')}>
                        <FontAwesome
                            name="th-large"
                            size={22}
                            color={viewType === 'grid' ? 'blue' : 'gray'}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Input */}
            {searchVisible && (
                <View style={globalStyles.homeSearchRow}>
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

            {/* Item List / Grid */}
            <FlatList
                ref={flatListRef}
                data={data}
                key={viewType}
                keyExtractor={(item) => item.id.toString()}
                numColumns={viewType === 'grid' ? 2 : 1}

                contentContainerStyle={globalStyles.listContainer}
                renderItem={renderItem}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListFooterComponent={loadingMore ? <ActivityIndicator style={globalStyles.homeActivityIndicator} /> : null}
                ListEmptyComponent={() => (
                    <View>
                        <Text style={globalStyles.titleText}>No data available</Text>
                    </View>
                )}
            />

            {/* Scroll to top button */}
            {showScrollTop && (
                <TouchableOpacity
                    onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
                    style={[globalStyles.homeScrollTopButton, { top: screenHeight / 2 + 225 }]}
                    activeOpacity={0.8}
                >
                    <FontAwesome name="chevron-up" size={18} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}

