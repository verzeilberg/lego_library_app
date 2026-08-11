import {View, Text, FlatList, TouchableOpacity, Dimensions, TextInput, ActivityIndicator} from "react-native";
import React, {useState, useCallback, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useStyles, useTheme} from "../../../styles";
import {fetchModelLists, searchUserSetLists} from "../../../components/Apicalls";
import AddModal from "../../../components/modals/AddModal";
import BoardImage from "../../../components/BoardImage";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import ErrorBanner from "../../../components/ui/ErrorBanner";

const PAGE_SIZE = 10;

export default function BordenScreen({navigation, setGlobalError, setGlobalLoading}) {
    const styles = useStyles();
    const { colors } = useTheme();
    const [data, setData] = useState([]);
    const [viewType, setViewType] = useState('card');
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const searchTimer = useRef(null);

    //Card dimension
    const screenWidth = Dimensions.get('window').width;
    const cardMargin = 16; // margin/padding from globalStyles
    const gridSpacing = 8;  // space between grid cards
    const numColumns = viewType === 'grid' ? 2 : 1;
    const cardWidth = (screenWidth - cardMargin * 2 - gridSpacing * (numColumns - 1)) / numColumns;
    const scaleText = useCallback((baseSize) => Math.max(12, Math.min(baseSize, cardWidth / 10)), [cardWidth]);

    const emptyListComponent = useCallback(() => (
        <View>
            <Text style={styles.titleText}>No data available</Text>
        </View>
    ), [styles]);

    const loadPage = useCallback((pageToLoad, replace = false, query = '') => {
        if (replace) {
            setGlobalLoading(true);
        } else {
            setLoadingMore(true);
        }
        const setter = replace ? setGlobalLoading : setLoadingMore;
        const onData = (result) => {
            const items = Array.isArray(result) ? result : [];
            setData(prev => {
                if (replace) return items;
                const ids = new Set(prev.map(item => item.id));
                return [...prev, ...items.filter(item => !ids.has(item.id))];
            });
            setHasMore(items.length === PAGE_SIZE);
        };
        if (query.trim() === '') {
            fetchModelLists(onData, setGlobalError, setter, pageToLoad, PAGE_SIZE);
        } else {
            searchUserSetLists(query, onData, setGlobalError, setter, pageToLoad, PAGE_SIZE);
        }
    }, [setGlobalError, setGlobalLoading]);

    const reloadData = useCallback(() => {
        setPage(1);
        setHasMore(true);
        loadPage(1, true, '');
    }, [loadPage]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            const trimmed = query.trim();
            setPage(1);
            setHasMore(true);
            loadPage(1, true, trimmed);
        }, 300);
    }, [loadPage]);

    useFocusEffect(useCallback(() => {
        reloadData();
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
    }, [reloadData]));

    const handleEndReached = useCallback(() => {
        if (loadingMore || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadPage(nextPage, false, searchQuery.trim());
    }, [loadingMore, hasMore, page, loadPage, searchQuery]);

    const ownerName = (item) => {
        if (!item.owner) return null;
        return item.owner.userName || `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim() || null;
    };

    const renderListItem = useCallback((item) => (
        <TouchableOpacity
            style={styles.homeListCard}
            onPress={() => navigation.navigate('Bord', {item})}
            activeOpacity={0.8}
        >
            <BoardImage
                bord={item}
                style={styles.homeListThumb}
            />
            <View style={styles.homeListInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.homeListTitle} numberOfLines={1}>{item.title}</Text>
                    {item.shared && (
                        <MaterialIcons name="group" size={14} color="blue" style={{ marginLeft: 6 }} />
                    )}
                </View>
                <Text style={styles.homeListDesc} numberOfLines={2}>{item.description}</Text>
                {item.shared && ownerName(item) && (
                    <Text style={[styles.homeListDesc, { fontSize: 12, marginTop: 4 }]} numberOfLines={1}>
                        Gedeeld door {ownerName(item)}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    ), [navigation]);

    const renderCardItem = useCallback((item) => (
        <TouchableOpacity
            style={[styles.card, viewType === 'grid' && styles.homeCardGrid]}
            onPress={() => navigation.navigate('Bord', {item})}
            activeOpacity={0.8}
        >
            <BoardImage
                bord={item}
                style={styles.modelListImage}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[styles.titleText, {fontSize: scaleText(16)}]}>
                    {item.title}
                </Text>
                {item.shared && (
                    <MaterialIcons name="group" size={14} color="blue" style={{ marginLeft: 4 }} />
                )}
            </View>
            <Text style={[styles.descriptionText, {fontSize: scaleText(14), textAlign: 'center'}]}>
                {item.description}
            </Text>
            {item.shared && ownerName(item) && (
                <Text style={[styles.descriptionText, {fontSize: scaleText(11), marginTop: 2 }]} numberOfLines={1}>
                    Gedeeld door {ownerName(item)}
                </Text>
            )}
        </TouchableOpacity>
    ), [viewType, navigation, scaleText]);

    const renderItem = useCallback(({ item }) => {
        if (viewType === 'list') return renderListItem(item);
        return renderCardItem(item);
    }, [viewType, renderListItem, renderCardItem]);




    return (
        <View style={styles.flex1}>
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
                <TouchableOpacity onPress={() => setModalVisible(true)} style={{ width: 36, height: 36, borderRadius: 6, borderWidth: 1.5, borderColor: 'green', justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialIcons name="playlist-add" size={18} color="green" />
                </TouchableOpacity>
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
                            reloadData();
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
                data={data}
                key={viewType} // forces re-render on toggle
                keyExtractor={(item) => item.id.toString()}
                numColumns={viewType === 'grid' ? 2 : 1}
                contentContainerStyle={styles.listContainer}
                renderItem={renderItem}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primaryLight} style={{marginVertical: 12}} /> : null}
                ListEmptyComponent={emptyListComponent}
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
