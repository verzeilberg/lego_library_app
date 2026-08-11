import {View, Text, Image, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, TextInput} from "react-native";
import React, {useCallback, useState, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useStyles, useTheme} from "../../styles";
import { fetchPublicSetLists } from "../../components/Apicalls";
import Config from "../../config/config";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import BoardImage from '../../components/BoardImage';
import ErrorBanner from '../../components/ui/ErrorBanner';

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
    const styles = useStyles();
    const { colors } = useTheme();
    const [data, setData] = useState([]);
    const [viewType, setViewType] = useState('card'); // 'card', 'list' or 'grid'
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const searchTimer = useRef(null);
    const flatListRef = useRef(null);

    //Card dimension
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const cardMargin = 16;
    const gridSpacing = 8;
    const numColumns = viewType === 'grid' ? 2 : 1;
    const cardWidth = (screenWidth - cardMargin * 2 - gridSpacing * (numColumns - 1)) / numColumns;

    const scaleText = (baseSize) => Math.max(12, Math.min(baseSize, cardWidth / 10));

    const loadPage = useCallback((pageToLoad, replace = false, query = '') => {
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
    }, [setGlobalLoading, setLoadingMore, setData, setHasMore]);

    useFocusEffect(
        useCallback(() => {
            setPage(1);
            setHasMore(true);
            loadPage(1, true, '');
            return () => {
                if (searchTimer.current) clearTimeout(searchTimer.current);
            };
        }, [])
    );

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setPage(1);
            setHasMore(true);
            loadPage(1, true, query.trim());
        }, 300);
    }, [loadPage]);

    const handleEndReached = useCallback(() => {
        if (loadingMore || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadPage(nextPage, false, searchQuery.trim());
    }, [loadingMore, hasMore, page, loadPage, searchQuery]);

    const renderItem = useCallback(({ item }) => {
        if (viewType === 'list') {
            return (
                <TouchableOpacity
                    style={styles.homeListCard}
                    onPress={() => navigation.navigate('PublicBord', { item })}
                    activeOpacity={0.8}
                >
                    <BoardImage
                        bord={item}
                        style={styles.homeListThumb}
                    />
                    <View style={styles.homeListInfo}>
                        <Text style={styles.homeListTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.homeListDesc} numberOfLines={2}>{item.description}</Text>
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
                        <Image source={ownerAvatar(item.owner)} style={styles.homeListAvatar} />
                    </TouchableOpacity>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    viewType === 'grid' && styles.homeCardGrid,
                ]}
                onPress={() => navigation.navigate('PublicBord', { item })}
                activeOpacity={0.8}
            >
                <BoardImage
                    bord={item}
                    style={styles.modelListImage}
                />
                <View style={styles.homeCardBody}>
                    <View style={styles.homeCardText}>
                        <Text style={[styles.titleText, styles.homeCardTitleText, { fontSize: scaleText(16) }]}>
                            {item.title}
                        </Text>
                        <Text style={[styles.descriptionText, styles.homeCardDescText, { fontSize: scaleText(14) }]}>
                            {item.description}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.homeOwnerButton}
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
                            style={styles.homeOwnerAvatar}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }, [viewType, navigation, scaleText]);

    const handleScroll = useCallback((event) => {
        setShowScrollTop(event.nativeEvent.contentOffset.y > 100);
    }, []);

    return (
        <View style={styles.homeScreenContainer}>
            {/* Error banner */}
            <ErrorBanner />
            {/* Toggle Buttons */}
            <View style={styles.homeToggleBar}>
                <View style={styles.homeToggleRight}>
                    <TouchableOpacity onPress={() => setViewType('card')} style={{ width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: '#0055BF', backgroundColor: viewType === 'card' ? '#0055BF' : 'transparent', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                        <FontAwesome
                            name="square"
                            size={16}
                            color={viewType === 'card' ? 'white' : '#0055BF'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewType('list')} style={{ width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: '#FE8A18', backgroundColor: viewType === 'list' ? '#FE8A18' : 'transparent', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                        <FontAwesome
                            name="list"
                            size={16}
                            color={viewType === 'list' ? 'white' : '#FE8A18'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewType('grid')} style={{ width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: '#009B4C', backgroundColor: viewType === 'grid' ? '#009B4C' : 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                        <FontAwesome
                            name="th-large"
                            size={16}
                            color={viewType === 'grid' ? 'white' : '#009B4C'}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Search */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.inputBg, borderColor: searchFocused ? 'blue' : colors.borderInput, borderWidth: 1, borderRadius: 8, height: 34, paddingHorizontal: 8 }}>
                <TextInput
                    style={{ flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 }}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    placeholder="Zoek borden of sets..."
                    placeholderTextColor={colors.textSecondary}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity
                        onPress={() => {
                            setSearchQuery('');
                            setPage(1);
                            setHasMore(true);
                            loadPage(1, true, '');
                        }}
                        style={{ marginLeft: 6 }}
                    >
                        <MaterialIcons name="close" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
                <MaterialIcons name="search" size={18} color={colors.textSecondary} style={{ marginLeft: 6 }} />
            </View>

            {/* Item List / Grid */}
            <FlatList
                ref={flatListRef}
                data={data}
                key={viewType}
                keyExtractor={(item) => item.id.toString()}
                numColumns={viewType === 'grid' ? 2 : 1}

                contentContainerStyle={styles.listContainer}
                renderItem={renderItem}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.homeActivityIndicator} /> : null}
                ListEmptyComponent={useCallback(() => (
                    <View>
                        <Text style={styles.titleText}>No data available</Text>
                    </View>
                ), [])}
            />

            {/* Scroll to top button */}
            {showScrollTop && (
                <TouchableOpacity
                    onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
                    style={[styles.homeScrollTopButton, { top: screenHeight / 2 + 225 }]}
                    activeOpacity={0.8}
                >
                    <FontAwesome name="chevron-up" size={18} color="white" style={styles.homeScrollTopIcon} />
                </TouchableOpacity>
            )}
        </View>
    );
}

