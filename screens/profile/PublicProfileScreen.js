import React, {useEffect, useState, useRef} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator, Dimensions} from 'react-native';
import Config from '../../config/config';
import {globalStyles} from '../../styles';
import {FontAwesome} from '@expo/vector-icons';
import {fetchPublicUserData, fetchPublicUserBords} from '../../components/Apicalls';

const PROFILE_IMAGES = {
    vrouw: require('../../assets/images/minifigure-portrait-female.png'),
    man: require('../../assets/images/minifigure-portrait-male.png'),
    default: require('../../assets/images/minifigure-portrait-gender-neutral.png'),
};

const defaultImageForGeslacht = (geslacht) =>
    PROFILE_IMAGES[geslacht] ?? PROFILE_IMAGES.default;

const PublicProfileScreen = ({route, navigation, setGlobalLoading, setGlobalError}) => {
    const {userId} = route.params;

    const [data, setData] = useState(null);
    const [bords, setBords] = useState([]);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const PAGE_SIZE = 10;
    const scrollRef = useRef(null);
    const screenHeight = Dimensions.get('window').height;

    const geslacht = (data?.geslacht || '').trim().toLowerCase();
    const profilePicture = data?.profilePicture
        ? `${Config.API_BASE_URL}${data.profilePicture}`
        : '';

    useEffect(() => {
        setGlobalLoading(true);
        fetchPublicUserData(userId, setData, setGlobalError, setGlobalLoading);
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
        <View style={globalStyles.flex1}>
        <ScrollView
            ref={scrollRef}
            style={globalStyles.flex1}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >

            {/* Profile header */}
            <View style={styles.profileHeader}>
                <TouchableOpacity onPress={() => profilePicture && setShowImagePreview(true)}>
                    <Image
                        source={profilePicture ? {uri: profilePicture} : defaultImageForGeslacht(geslacht)}
                        style={globalStyles.imageRoundContainer}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                <Text style={globalStyles.nameText}>{data.userName}</Text>
                <Text style={globalStyles.nameText}>{data.firstName} {data.lastName}</Text>
                {data.bio ? <Text style={globalStyles.emailText}>{data.bio}</Text> : null}
                {geslachtLabel ? <Text style={globalStyles.emailText}>{geslachtLabel}</Text> : null}
            </View>

            {/* Bords */}
            {bords.length > 0 && (
                <View style={styles.bordsSection}>
                    <Text style={styles.bordsTitle}>Bords</Text>
                    {bords.map((bord) => (
                        <TouchableOpacity
                            key={bord.id}
                            style={globalStyles.card}
                            onPress={() => navigation.navigate('PublicBord', {item: bord})}
                            activeOpacity={0.8}
                        >
                            {bord.filePath ? (
                                <Image
                                    source={{uri: Config.API_BASE_URL + bord.filePath}}
                                    style={[globalStyles.modelListImage, {aspectRatio: 8/3}]}
                                />
                            ) : null}
                            <Text style={globalStyles.titleText}>{bord.title}</Text>
                            {bord.description ? (
                                <Text style={globalStyles.descriptionText}>{bord.description}</Text>
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {loadingMore && <ActivityIndicator style={{marginVertical: 16}}/>}

            {/* Full image preview modal */}
            <Modal visible={showImagePreview && !!profilePicture} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.previewOverlay}
                    activeOpacity={1}
                    onPress={() => setShowImagePreview(false)}
                >
                    <Image
                        source={{uri: profilePicture}}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </Modal>

        </ScrollView>

        {showScrollTop && (
            <TouchableOpacity
                onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
                style={[globalStyles.homeScrollTopButton, { top: screenHeight / 2 + 225 }]}
                activeOpacity={0.8}
            >
                <FontAwesome name="chevron-up" size={18} color="white" />
            </TouchableOpacity>
        )}
        </View>
    );
};

const styles = StyleSheet.create({
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
    bordsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
});

export default PublicProfileScreen;
