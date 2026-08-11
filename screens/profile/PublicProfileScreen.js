import React, {useEffect, useState, useRef, useMemo} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator, Dimensions} from 'react-native';
import Config from '../../config/config';
import {useStyles, useTheme} from '../../styles';
import {FontAwesome} from '@expo/vector-icons';
import {fetchPublicUserData, fetchPublicUserBords, fetchFriendshipStatus, sendFriendRequest, acceptFriendRequest, removeFriend} from '../../components/Apicalls';
import ErrorBanner from '../../components/ui/ErrorBanner';

const PROFILE_IMAGES = {
    vrouw: require('../../assets/images/minifigure-portrait-female.png'),
    man: require('../../assets/images/minifigure-portrait-male.png'),
    default: require('../../assets/images/minifigure-portrait-gender-neutral.png'),
};

const defaultImageForGeslacht = (geslacht) =>
    PROFILE_IMAGES[geslacht] ?? PROFILE_IMAGES.default;

const FRIEND_BUTTON_LABELS = {
    none: 'Vriend toevoegen',
    pending_sent: 'Verzoek verzonden',
    pending_received: 'Verzoek accepteren',
    accepted: 'Vriend verwijderen',
};

const FriendButton = ({status, onPress, buttonColors}) => {
    if (!status) return null;
    const label = FRIEND_BUTTON_LABELS[status.status] ?? 'Vriend toevoegen';
    const isSent = status.status === 'pending_sent';
    const isRemove = status.status === 'accepted';
    return (
        <TouchableOpacity
            style={[
                {
                    marginTop: 14,
                    backgroundColor: buttonColors.primaryLight,
                    paddingHorizontal: 24,
                    paddingVertical: 9,
                    borderRadius: 20,
                },
                isSent && {backgroundColor: buttonColors.disabled},
                isRemove && {backgroundColor: buttonColors.danger},
            ]}
            onPress={onPress}
            disabled={isSent}
            activeOpacity={0.7}
        >
            <Text style={[
                {color: buttonColors.textLight, fontWeight: '600', fontSize: 14},
                isSent && {color: buttonColors.textMuted},
            ]}>{label}</Text>
        </TouchableOpacity>
    );
};

const PublicProfileScreen = ({route, navigation, setGlobalLoading, setGlobalError}) => {
    const styles = useStyles();
    const { colors } = useTheme();
    const {userId} = route.params ?? {};
    if (!userId) return null;

    const scrollStyles = useMemo(() => StyleSheet.create({
        scrollContent: {
            paddingBottom: 60,
        },
        profileHeader: {
            alignItems: 'center',
            paddingTop: 24,
            paddingHorizontal: 20,
            marginBottom: 8,
        },
        bordsSection: {
            paddingHorizontal: 16,
            marginTop: 16,
        },
        bordsHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        bordsTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
        },
        gridRow: {
            flexDirection: 'row',
            gap: 8,
        },
    }), [colors]);

    const [data, setData] = useState(null);
    const [bords, setBords] = useState([]);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [friendStatus, setFriendStatus] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [viewType, setViewType] = useState('card'); // 'card', 'list' or 'grid'
    const PAGE_SIZE = 10;
    const scrollRef = useRef(null);
    const {height: screenHeight, width: screenWidth} = Dimensions.get('window');

    const geslacht = (data?.geslacht || '').trim().toLowerCase();
    const profilePicture = data?.profilePicture
        ? `${Config.API_BASE_URL}${data.profilePicture}`
        : '';

    useEffect(() => {
        setGlobalLoading(true);
        fetchPublicUserData(userId, setData, setGlobalError, setGlobalLoading);
        fetchFriendshipStatus(userId, setFriendStatus, setGlobalError);
        fetchPublicUserBords(userId, (result) => {
            setBords(result);
            setHasMore(result.length === PAGE_SIZE);
        }, setGlobalError, () => {}, 1, PAGE_SIZE);
    }, [userId]);

    const loadMoreBords = () => {
        if (loadingMore || !hasMore) return;
        const nextPage = page + 1;
        setLoadingMore(true);
        fetchPublicUserBords(userId, (result) => {
            setBords(prev => {
                const ids = new Set(prev.map(b => b.id));
                return [...prev, ...result.filter(b => !ids.has(b.id))];
            });
            setHasMore(result.length === PAGE_SIZE);
            setPage(nextPage);
        }, setGlobalError, () => setLoadingMore(false), nextPage, PAGE_SIZE);
    };

    const handleScroll = ({nativeEvent}) => {
        const {contentOffset, contentSize, layoutMeasurement} = nativeEvent;
        setShowScrollTop(contentOffset.y > 100);
        if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 100) {
            loadMoreBords();
        }
    };

    if (!data) return null;

    const geslachtLabel =
        geslacht === 'man' ? 'Man' :
        geslacht === 'vrouw' ? 'Vrouw' :
        geslacht ? 'Geslacht neutraal' : null;

    return (
        <View style={styles.flex1}>
        <ScrollView
            ref={scrollRef}
            style={styles.flex1}
            contentContainerStyle={scrollStyles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >

            <ErrorBanner />
            {/* Profile header */}
            <View style={scrollStyles.profileHeader}>
                <TouchableOpacity onPress={() => profilePicture && setShowImagePreview(true)}>
                    <Image
                        source={profilePicture ? {uri: profilePicture} : defaultImageForGeslacht(geslacht)}
                        style={styles.imageRoundContainer}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                <Text style={styles.nameText}>{data.userName}</Text>
                <Text style={styles.nameText}>{data.firstName} {data.lastName}</Text>
                {data.bio ? <Text style={styles.emailText}>{data.bio}</Text> : null}
                {geslachtLabel ? <Text style={styles.emailText}>{geslachtLabel}</Text> : null}
                <FriendButton
                    status={friendStatus}
                    buttonColors={colors}
                    onPress={async () => {
                        if (!friendStatus || friendStatus.status === 'none') {
                            const res = await sendFriendRequest(userId, setGlobalError);
                            if (res) setFriendStatus({status: 'pending_sent', friendshipId: res.requestId});
                        } else if (friendStatus.status === 'pending_received') {
                            const ok = await acceptFriendRequest(friendStatus.friendshipId, setGlobalError);
                            if (ok) setFriendStatus({...friendStatus, status: 'accepted'});
                        } else if (friendStatus.status === 'accepted') {
                            const ok = await removeFriend(friendStatus.friendshipId, setGlobalError);
                            if (ok) setFriendStatus({status: 'none', friendshipId: null});
                        }
                    }}
                />
            </View>

            {/* Bords */}
            {bords.length > 0 && (
                <View style={scrollStyles.bordsSection}>
                    <View style={scrollStyles.bordsHeader}>
                        <Text style={scrollStyles.bordsTitle}>Bords</Text>
                        <View style={styles.homeToggleRight}>
                            <TouchableOpacity onPress={() => setViewType('card')} style={{ width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: '#0055BF', backgroundColor: viewType === 'card' ? '#0055BF' : 'transparent', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                <FontAwesome name="square" size={16} color={viewType === 'card' ? 'white' : '#0055BF'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setViewType('list')} style={{ width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: '#FE8A18', backgroundColor: viewType === 'list' ? '#FE8A18' : 'transparent', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                <FontAwesome name="list" size={16} color={viewType === 'list' ? 'white' : '#FE8A18'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setViewType('grid')} style={{ width: 34, height: 34, borderRadius: 6, borderWidth: 1.5, borderColor: '#009B4C', backgroundColor: viewType === 'grid' ? '#009B4C' : 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                                <FontAwesome name="th-large" size={16} color={viewType === 'grid' ? 'white' : '#009B4C'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {viewType === 'list' && bords.map((bord) => (
                        <TouchableOpacity
                            key={bord.id}
                            style={styles.homeListCard}
                            onPress={() => navigation.navigate('PublicBord', {item: bord})}
                            activeOpacity={0.8}
                        >
                            {bord.filePath ? (
                                <Image
                                    source={{uri: Config.API_BASE_URL + bord.filePath}}
                                    style={styles.homeListThumb}
                                />
                            ) : null}
                            <View style={styles.homeListInfo}>
                                <Text style={styles.homeListTitle} numberOfLines={1}>{bord.title}</Text>
                                {bord.description ? <Text style={styles.homeListDesc} numberOfLines={2}>{bord.description}</Text> : null}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {viewType === 'grid' && (() => {
                        const rows = [];
                        for (let i = 0; i < bords.length; i += 2) rows.push(bords.slice(i, i + 2));
                        return rows.map((row, rowIndex) => (
                            <View key={rowIndex} style={scrollStyles.gridRow}>
                                {row.map((bord) => (
                                    <TouchableOpacity
                                        key={bord.id}
                                        style={[styles.card, styles.homeCardGrid]}
                                        onPress={() => navigation.navigate('PublicBord', {item: bord})}
                                        activeOpacity={0.8}
                                    >
                                        {bord.filePath ? (
                                            <Image
                                                source={{uri: Config.API_BASE_URL + bord.filePath}}
                                                style={styles.modelListImage}
                                            />
                                        ) : null}
                                        <Text style={styles.titleText} numberOfLines={1}>{bord.title}</Text>
                                        {bord.description ? <Text style={styles.descriptionText} numberOfLines={2}>{bord.description}</Text> : null}
                                    </TouchableOpacity>
                                ))}
                                {row.length === 1 && <View style={[styles.card, styles.homeCardGrid, {opacity: 0}]} />}
                            </View>
                        ));
                    })()}

                    {viewType === 'card' && bords.map((bord) => (
                        <TouchableOpacity
                            key={bord.id}
                            style={styles.card}
                            onPress={() => navigation.navigate('PublicBord', {item: bord})}
                            activeOpacity={0.8}
                        >
                            {bord.filePath ? (
                                <Image
                                    source={{uri: Config.API_BASE_URL + bord.filePath}}
                                    style={[styles.modelListImage, {aspectRatio: 8/3}]}
                                />
                            ) : null}
                            <Text style={styles.titleText}>{bord.title}</Text>
                            {bord.description ? (
                                <Text style={styles.descriptionText}>{bord.description}</Text>
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {loadingMore && <ActivityIndicator style={{marginVertical: 16}}/>}

            {/* Full image preview modal */}
            <Modal visible={showImagePreview && !!profilePicture} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.imagePreviewOverlay}
                    activeOpacity={1}
                    onPress={() => setShowImagePreview(false)}
                >
                    <Image
                        source={{uri: profilePicture}}
                        style={styles.imagePreviewImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </Modal>

        </ScrollView>

        {showScrollTop && (
            <TouchableOpacity
                onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
                style={[styles.homeScrollTopButton, { top: screenHeight / 2 + 225 }]}
                activeOpacity={0.8}
            >
                <FontAwesome name="chevron-up" size={18} color="white" />
            </TouchableOpacity>
        )}
        </View>
    );
};

export default PublicProfileScreen;
