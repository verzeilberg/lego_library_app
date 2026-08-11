import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import React, {useCallback, useState, useRef} from 'react';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useStyles, useTheme } from '../../../styles';
import Config from '../../../config/config';
import { reloadData as reloadBordData } from "../../../components/Apicalls";
import BoardImage from '../../../components/BoardImage';
import TypeBadge from '../../../components/ui/TypeBadge';
import {useFocusEffect} from "@react-navigation/native";
import ErrorBanner from '../../../components/ui/ErrorBanner';

const PAGE_SIZE = 10;

export default function PublicBordScreen({ route, navigation, setGlobalError, setGlobalLoading }) {
    const styles = useStyles();
    const { colors } = useTheme();
    const { item } = route.params;
    const [bord, setBord] = useState(item);

    const [viewType, setViewType] = useState('card'); // 'card', 'list' or 'grid'
    const [items, setItems] = useState([]); // Items inside the bord
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const searchTimer = useRef(null);

    const screenWidth = Dimensions.get('window').width;
    const cardMargin = 16;
    const gridSpacing = 8;
    const numColumns = viewType === 'grid' ? 2 : 1;
    const cardWidth = (screenWidth - cardMargin * 2 - gridSpacing * (numColumns - 1)) / numColumns;

    const scaleText = (baseSize) => Math.max(12, Math.min(baseSize, cardWidth / 10));

    const loadPage = useCallback((pageToLoad, replace = false, query = '') => {
        const setter = replace
            ? (value) => { setGlobalLoading(value); if (!value) setIsLoading(false); }
            : setLoadingMore;
        reloadBordData(bord.id, setter, (data) => {
            const result = Array.isArray(data) ? data : [];
            setItems(prev => {
                if (replace) return result;
                const ids = new Set(prev.map(i => i.id));
                return [...prev, ...result.filter(i => !ids.has(i.id))];
            });
            setHasMore(result.length === PAGE_SIZE);
            if (replace) setIsLoading(false);
        }, setGlobalError, pageToLoad, PAGE_SIZE, query);
    }, [bord.id, setGlobalError, setGlobalLoading]);

    const reloadItems = useCallback((query = '') => {
        setPage(1);
        setHasMore(true);
        loadPage(1, true, query);
    }, [loadPage]);

    useFocusEffect(
        useCallback(() => {
            reloadItems();
            return () => {
                if (searchTimer.current) clearTimeout(searchTimer.current);
            };
        }, [reloadItems])
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
        const onPress = () => {
            if (item.isSet) {
                navigation.navigate('PublicSetDetail', { item, bordId: bord.id });
            } else {
                navigation.push('PublicBord', { item });
            }
        };

        if (viewType === 'list') {
            return (
                <TouchableOpacity
                    style={styles.homeListCard}
                    onPress={onPress}
                    activeOpacity={0.8}
                >
                    {item.isSet ? (
                        item.filePath ? (
                            <Image source={{ uri: Config.API_BASE_URL + item.filePath }} style={styles.homeListThumb} />
                        ) : (
                            <View style={styles.homeListThumb} />
                        )
                    ) : (
                        <BoardImage bord={item} style={styles.homeListThumb} />
                    )}
                    <TypeBadge isSet={item.isSet} />
                    <View style={styles.homeListInfo}>
                        <Text style={styles.homeListTitle} numberOfLines={1}>
                            {item.isSet ? `${item.id} ${item.title}` : item.title}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    viewType === 'grid' && { flex: 1, margin: gridSpacing }
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                {item.isSet ? (
                    item.filePath && (
                        <Image
                            source={{ uri: Config.API_BASE_URL + item.filePath }}
                            style={styles.modelListImage}
                        />
                    )
                ) : (
                    <BoardImage bord={item} style={styles.modelListImage} />
                )}
                <TypeBadge isSet={item.isSet} />

                <Text style={[styles.titleText, { fontSize: scaleText(16) }]}>
                    {item.isSet ? `${item.id} ${item.title}` : item.title}
                </Text>
            </TouchableOpacity>
        );
    }, [viewType, navigation, bord.id, scaleText]);

    return (
        <View style={styles.flex1}>
            {/* Error banner */}
            <ErrorBanner />
            <View style={styles.screenPadding}>
            {/* Bord image - auto-compose from sets if no bord image */}
            <BoardImage
                bord={bord}
                items={items}
                style={styles.bordHeaderImage}
                resizeMode="cover"
            />

            {/* Title and Description */}
            <Text style={[styles.titleText, { marginTop: 16 }]}>{bord.title}</Text>
            <Text style={[styles.descriptionText, { marginTop: 8 }]}>{bord.description}</Text>

            {/* View toggle + Search */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                <TouchableOpacity onPress={() => setViewType('card')} style={[styles.homeToggleListButton, { width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: '#0055BF', backgroundColor: viewType === 'card' ? '#0055BF' : 'transparent', justifyContent: 'center', alignItems: 'center' }]}>
                    <FontAwesome name="square" size={16} color={viewType === 'card' ? 'white' : '#0055BF'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewType('list')} style={[styles.homeToggleListButton, { width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: '#FE8A18', backgroundColor: viewType === 'list' ? '#FE8A18' : 'transparent', justifyContent: 'center', alignItems: 'center' }]}>
                    <FontAwesome name="list" size={16} color={viewType === 'list' ? 'white' : '#FE8A18'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setViewType('grid')} style={{ width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: '#009B4C', backgroundColor: viewType === 'grid' ? '#009B4C' : 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome name="th-large" size={16} color={viewType === 'grid' ? 'white' : '#009B4C'} />
                </TouchableOpacity>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8, backgroundColor: colors.inputBg, borderColor: searchFocused ? 'blue' : colors.borderInput, borderWidth: 1, borderRadius: 8, height: 34, paddingHorizontal: 8 }}>
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
                        <TouchableOpacity onPress={() => { setSearchQuery(''); setPage(1); setHasMore(true); loadPage(1, true, ''); }} style={{ marginLeft: 6 }}>
                            <MaterialIcons name="close" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                    <MaterialIcons name="search" size={18} color={colors.textSecondary} style={{ marginLeft: 6 }} />
                </View>
            </View>

            {/* FlatList for items */}
            <FlatList
                data={items}
                key={viewType}
                keyExtractor={(item) => `${item.isSet ? 'set-' : 'item-'}${item.id}`}
                numColumns={numColumns}
                contentContainerStyle={styles.listContainer}
                renderItem={renderItem}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                ListFooterComponent={loadingMore ? <ActivityIndicator style={{marginVertical: 12}} /> : null}
                ListEmptyComponent={() => !isLoading ? (
                    <View>
                        <Text style={styles.titleText}>No sets/list available</Text>
                    </View>
                ) : null}
            />
            </View>
        </View>
    );
}