import React, {useCallback, useState, useMemo} from 'react';
import {
    View, Text, Image, FlatList, TouchableOpacity,
    StyleSheet, Alert, RefreshControl, TextInput,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {FontAwesome} from '@expo/vector-icons';
import Config from '../../config/config';
import {useTheme} from '../../styles';
import {fetchFriends, acceptFriendRequest, removeFriend} from '../../components/Apicalls';
import ErrorBanner from '../../components/ui/ErrorBanner';

const PROFILE_IMAGES = {
    vrouw: require('../../assets/images/minifigure-portrait-female.png'),
    man: require('../../assets/images/minifigure-portrait-male.png'),
    default: require('../../assets/images/minifigure-portrait-gender-neutral.png'),
};

const avatarSource = (profilePicture, geslacht) => {
    if (profilePicture) return {uri: `${Config.API_BASE_URL}${profilePicture}`};
    return PROFILE_IMAGES[geslacht] ?? PROFILE_IMAGES.default;
};

const FriendsScreen = ({navigation, setGlobalError, setGlobalLoading}) => {
    const { colors } = useTheme();
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const load = useCallback((showSpinner = true) => {
        if (showSpinner) setGlobalLoading(true);
        fetchFriends(
            (data) => {
                setFriends(data.friends ?? []);
                setPendingRequests(data.pendingRequests ?? []);
            },
            setGlobalError,
            () => {
                setGlobalLoading(false);
                setRefreshing(false);
            },
        );
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const handleAccept = async (requestId) => {
        const ok = await acceptFriendRequest(requestId, setGlobalError);
        if (ok) load(false);
    };

    const handleRemove = (friendshipId, name) => {
        Alert.alert(
            'Vriend verwijderen',
            `Weet je zeker dat je ${name} wilt verwijderen?`,
            [
                {text: 'Annuleren', style: 'cancel'},
                {
                    text: 'Verwijderen', style: 'destructive',
                    onPress: async () => {
                        const ok = await removeFriend(friendshipId, setGlobalError);
                        if (ok) load(false);
                    },
                },
            ],
        );
    };

    const handleDecline = (friendshipId) => {
        Alert.alert(
            'Verzoek weigeren',
            'Weet je zeker dat je dit verzoek wilt weigeren?',
            [
                {text: 'Annuleren', style: 'cancel'},
                {
                    text: 'Weigeren', style: 'destructive',
                    onPress: async () => {
                        const ok = await removeFriend(friendshipId, setGlobalError);
                        if (ok) load(false);
                    },
                },
            ],
        );
    };

    const goToProfile = (userId) => navigation.navigate('PublicProfile', {userId});

    const renderRequest = ({item}) => (
        <View style={localStyles.row}>
            <TouchableOpacity style={localStyles.userInfo} onPress={() => goToProfile(item.id)}>
                <Image
                    source={avatarSource(item.profilePicture, item.geslacht)}
                    style={localStyles.avatar}
                    resizeMode="cover"
                />
                <View style={localStyles.nameBlock}>
                    <Text style={localStyles.name}>{item.firstName} {item.lastName}</Text>
                    {item.userName ? <Text style={localStyles.username}>@{item.userName}</Text> : null}
                </View>
            </TouchableOpacity>
            <View style={localStyles.actions}>
                <TouchableOpacity style={localStyles.acceptBtn} onPress={() => handleAccept(item.friendshipId)}>
                    <Text style={localStyles.acceptText}>Accepteer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={localStyles.declineBtn} onPress={() => handleDecline(item.friendshipId)}>
                    <Text style={localStyles.declineText}>Weiger</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFriend = ({item}) => (
        <TouchableOpacity style={localStyles.row} onPress={() => goToProfile(item.id)} activeOpacity={0.7}>
            <Image
                source={avatarSource(item.profilePicture, item.geslacht)}
                style={localStyles.avatar}
                resizeMode="cover"
            />
            <View style={localStyles.nameBlock}>
                <Text style={localStyles.name}>{item.firstName} {item.lastName}</Text>
                {item.userName ? <Text style={localStyles.username}>@{item.userName}</Text> : null}
            </View>
            <TouchableOpacity
                style={localStyles.removeBtn}
                onPress={() => handleRemove(item.friendshipId, `${item.firstName} ${item.lastName}`)}
            >
                <FontAwesome name="trash" size={22} color={colors.textLight} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const filteredPendingRequests = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return pendingRequests;
        return pendingRequests.filter(r =>
            `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
            (r.userName || '').toLowerCase().includes(q)
        );
    }, [pendingRequests, searchQuery]);

    const filteredFriends = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return friends;
        return friends.filter(f =>
            `${f.firstName} ${f.lastName}`.toLowerCase().includes(q) ||
            (f.userName || '').toLowerCase().includes(q)
        );
    }, [friends, searchQuery]);

    const data = [
        ...(filteredPendingRequests.length > 0 ? [{type: 'header', title: 'Verzoeken', key: 'h-requests'}] : []),
        ...filteredPendingRequests.map(r => ({...r, type: 'request', key: `req-${r.friendshipId}`})),
        ...(filteredFriends.length > 0 ? [{type: 'header', title: 'Vrienden', key: 'h-friends'}] : []),
        ...filteredFriends.map(f => ({...f, type: 'friend', key: `fr-${f.friendshipId}`})),
    ];

    const renderItem = ({item}) => {
        if (item.type === 'header') {
            return <Text style={localStyles.sectionHeader}>{item.title}</Text>;
        }
        if (item.type === 'request') return renderRequest({item});
        return renderFriend({item});
    };

    const ListEmpty = () => {
        const hasAny = friends.length > 0 || pendingRequests.length > 0;
        if (hasAny && searchQuery.trim()) return (
            <Text style={localStyles.empty}>Geen resultaten gevonden voor "{searchQuery.trim()}"</Text>
        );
        if (!hasAny) return (
            <Text style={localStyles.empty}>Je hebt nog geen vrienden.{'\n'}Bezoek een profiel om een verzoek te sturen.</Text>
        );
        return null;
    };

    const localStyles = useMemo(() => StyleSheet.create({
        list: {
            padding: 16,
            flexGrow: 1,
        },
        sectionHeader: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
            marginTop: 12,
            marginBottom: 8,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            marginBottom: 10,
            elevation: 2,
            shadowColor: colors.cardShadow,
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.08,
            shadowRadius: 3,
        },
        userInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        avatar: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.border,
            marginRight: 12,
        },
        nameBlock: {
            flex: 1,
        },
        name: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        username: {
            fontSize: 13,
            color: colors.textMuted,
            marginTop: 2,
        },
        actions: {
            flexDirection: 'column',
            gap: 6,
        },
        acceptBtn: {
            backgroundColor: colors.primaryLight,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
        },
        acceptText: {
            color: colors.textLight,
            fontSize: 13,
            fontWeight: '600',
        },
        declineBtn: {
            backgroundColor: colors.surfaceAlt,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
        },
        declineText: {
            color: colors.textSecondary,
            fontSize: 13,
        },
        removeBtn: {
            backgroundColor: colors.danger,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
        },
        searchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 16,
            marginVertical: 8,
            backgroundColor: colors.surface,
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 40,
        },
        searchInput: {
            flex: 1,
            fontSize: 15,
            color: colors.text,
            paddingVertical: 0,
        },
        empty: {
            textAlign: 'center',
            color: colors.textMuted,
            marginTop: 60,
            fontSize: 15,
            lineHeight: 24,
        },
    }), [colors]);

    return (
        <View style={{flex: 1}}>
            <ErrorBanner />
            <View style={localStyles.searchRow}>
                <FontAwesome name="search" size={16} color={colors.textSecondary} style={{marginRight: 8}} />
                <TextInput
                    style={localStyles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Zoek vrienden..."
                    placeholderTextColor={colors.textSecondary}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <FontAwesome name="close" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={data}
                keyExtractor={item => item.key}
                renderItem={renderItem}
                contentContainerStyle={localStyles.list}
                ListEmptyComponent={ListEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); load(false); }}
                    />
                }
            />
        </View>
    );
};

export default FriendsScreen;
