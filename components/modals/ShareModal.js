import { Modal, Text, TouchableOpacity, View, FlatList, ActivityIndicator, Image } from "react-native";
import { useStyles, useTheme } from "../../styles";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from '@expo/vector-icons';
import { apiFetch, shareBoardWithUser, unshareBoard } from "../Apicalls";
import Config from "../../config/config";

export default function ShareModal({
    modalVisible,
    setModalVisible,
    boardId,
    setGlobalError,
    setGlobalLoading,
}) {
    const styles = useStyles();
    const { colors } = useTheme();
    const [friends, setFriends] = useState([]);
    const [sharedUserIds, setSharedUserIds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!modalVisible) return;
        loadData();
    }, [modalVisible, boardId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [friendsRes, boardRes] = await Promise.all([
                apiFetch('/api/friends'),
                apiFetch(`/api/set-list/${boardId}`),
            ]);

            if (friendsRes.ok) {
                const data = await friendsRes.json();
                setFriends(data.friends || []);
            }

            if (boardRes.ok) {
                const board = await boardRes.json();
                setSharedUserIds(board.sharedWith || []);
            }
        } catch (error) {
            setGlobalError('Error loading data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const isShared = (userId) => sharedUserIds.includes(userId);

    const toggleShare = async (userId) => {
        if (isShared(userId)) {
            const ok = await unshareBoard(boardId, userId, setGlobalError);
            if (ok) {
                setSharedUserIds(prev => prev.filter(id => id !== userId));
            }
        } else {
            const ok = await shareBoardWithUser(boardId, userId, setGlobalError);
            if (ok) {
                setSharedUserIds(prev => [...prev, userId]);
            }
        }
    };

    return (
        <View>
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                            <Text style={styles.h1}>Deel bord met vrienden</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.setDetailCloseButton}
                                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primaryLight} />
                        ) : friends.length === 0 ? (
                            <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>
                                Geen vrienden om mee te delen
                            </Text>
                        ) : (
                            <FlatList
                                data={friends}
                                style={{ width: '100%' }}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={({ item }) => {
                                    const shared = isShared(item.id);
                                    return (
                                        <TouchableOpacity
                                            onPress={() => toggleShare(item.id)}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                padding: 14,
                                                borderBottomWidth: 1,
                                                borderBottomColor: colors.border,
                                                backgroundColor: shared ? colors.primaryLight + '20' : 'transparent',
                                            }}
                                        >
                                            {item.profilePicture ? (
                                                <Image
                                                    source={{ uri: Config.API_BASE_URL + item.profilePicture }}
                                                    style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }}
                                                />
                                            ) : (
                                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.border, marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
                                                    <MaterialIcons name="person" size={20} color={colors.textSecondary} />
                                                </View>
                                            )}
                                            <View style={{ flex: 1, marginRight: 8 }}>
                                                <Text style={{ color: '#000', fontSize: 16 }}>
                                                    {`${item.firstName || ''} ${item.lastName || ''}`.trim() || item.userName || `Vriend #${item.id}`}
                                                </Text>
                                            </View>
                                            <MaterialIcons
                                                name={shared ? 'check-circle' : 'check-circle-outline'}
                                                size={24}
                                                color={shared ? 'green' : colors.textSecondary}
                                                style={{ marginLeft: 8 }}
                                            />
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
