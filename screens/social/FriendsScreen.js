import React, {useCallback, useState} from 'react';
import {
    View, Text, Image, FlatList, TouchableOpacity,
    StyleSheet, Alert, RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Config from '../../config/config';
import {globalStyles} from '../../styles';
import {fetchFriends, acceptFriendRequest, removeFriend} from '../../components/Apicalls';

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
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

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
        <View style={styles.row}>
            <TouchableOpacity style={styles.userInfo} onPress={() => goToProfile(item.id)}>
                <Image
                    source={avatarSource(item.profilePicture, item.geslacht)}
                    style={styles.avatar}
                    resizeMode="cover"
                />
                <View style={styles.nameBlock}>
                    <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                    {item.userName ? <Text style={styles.username}>@{item.userName}</Text> : null}
                </View>
            </TouchableOpacity>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.friendshipId)}>
                    <Text style={styles.acceptText}>Accepteer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(item.friendshipId)}>
                    <Text style={styles.declineText}>Weiger</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFriend = ({item}) => (
        <TouchableOpacity style={styles.row} onPress={() => goToProfile(item.id)} activeOpacity={0.7}>
            <Image
                source={avatarSource(item.profilePicture, item.geslacht)}
                style={styles.avatar}
                resizeMode="cover"
            />
            <View style={styles.nameBlock}>
                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                {item.userName ? <Text style={styles.username}>@{item.userName}</Text> : null}
            </View>
            <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item.friendshipId, `${item.firstName} ${item.lastName}`)}
            >
                <Text style={styles.removeText}>Verwijder</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const data = [
        ...(pendingRequests.length > 0 ? [{type: 'header', title: 'Verzoeken', key: 'h-requests'}] : []),
        ...pendingRequests.map(r => ({...r, type: 'request', key: `req-${r.friendshipId}`})),
        {type: 'header', title: 'Vrienden', key: 'h-friends'},
        ...friends.map(f => ({...f, type: 'friend', key: `fr-${f.friendshipId}`})),
    ];

    const renderItem = ({item}) => {
        if (item.type === 'header') {
            return <Text style={styles.sectionHeader}>{item.title}</Text>;
        }
        if (item.type === 'request') return renderRequest({item});
        return renderFriend({item});
    };

    const ListEmpty = () => (
        friends.length === 0 && pendingRequests.length === 0 ? (
            <Text style={styles.empty}>Je hebt nog geen vrienden.{'\n'}Bezoek een profiel om een verzoek te sturen.</Text>
        ) : null
    );

    return (
        <FlatList
            data={data}
            keyExtractor={item => item.key}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={ListEmpty}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); load(false); }}
                />
            }
        />
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 16,
        flexGrow: 1,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginTop: 12,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
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
        backgroundColor: '#e1e1e1',
        marginRight: 12,
    },
    nameBlock: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    username: {
        fontSize: 13,
        color: '#777',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'column',
        gap: 6,
    },
    acceptBtn: {
        backgroundColor: '#007bff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    acceptText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    declineBtn: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    declineText: {
        color: '#555',
        fontSize: 13,
    },
    removeBtn: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    removeText: {
        color: '#555',
        fontSize: 13,
    },
    empty: {
        textAlign: 'center',
        color: '#888',
        marginTop: 60,
        fontSize: 15,
        lineHeight: 24,
    },
});

export default FriendsScreen;
