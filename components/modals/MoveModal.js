import { Modal, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from "react-native";
import { useStyles, useTheme } from "../../styles";
import React, { useState, useEffect, useMemo } from "react";
import { MaterialIcons } from '@expo/vector-icons';
import { apiFetch } from "../Apicalls";

const buildTree = (boards, parentId = null, depth = 0) => {
    const result = [];
    for (const board of boards) {
        if (board.parentId === parentId) {
            result.push({ ...board, depth });
            result.push(...buildTree(boards, board.id, depth + 1));
        }
    }
    return result;
};

export default function MoveModal({
    modalVisible,
    setModalVisible,
    onMove,
    setGlobalError,
    setGlobalLoading,
    excludeId = null,
    title = "Verplaats naar welk bord?",
}) {
    const styles = useStyles();
    const { colors } = useTheme();
    const [boards, setBoards] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const treeItems = useMemo(() => {
        const filtered = boards.filter(b => b.id !== excludeId);
        return buildTree(filtered);
    }, [boards, excludeId]);

    useEffect(() => {
        if (!modalVisible) return;
        setSelectedBoardId(null);
        fetchBoards();
    }, [modalVisible]);

    const fetchBoards = async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/api/all-set-lists-for-user');
            if (response.ok) {
                const data = await response.json();
                setBoards(data);
            } else {
                const text = await response.text();
                setGlobalError('Error loading boards: ' + response.status + ' ' + text);
            }
        } catch (error) {
            setGlobalError('Error loading boards: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedBoard = boards.find(b => b.id === selectedBoardId);

    const handleConfirm = () => {
        if (!selectedBoardId) return;
        setModalVisible(false);
        onMove(selectedBoardId);
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
                            <Text style={styles.h1}>{title}</Text>
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
                        ) : (
                            <>
                                <TouchableOpacity
                                    onPress={() => setDropdownVisible(true)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        borderRadius: 8,
                                        padding: 12,
                                        backgroundColor: colors.card,
                                    }}
                                >
                                    <Text style={{ color: selectedBoard ? colors.text : colors.textSecondary, fontSize: 16 }}>
                                        {selectedBoard ? selectedBoard.title : 'Selecteer een bord...'}
                                    </Text>
                                    <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, { opacity: selectedBoardId ? 1 : 0.5, marginTop: 16 }]}
                                    onPress={handleConfirm}
                                    disabled={!selectedBoardId}
                                >
                                    <Text style={styles.buttonText}>Verplaatsen</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Dropdown modal */}
                        <Modal visible={dropdownVisible} transparent animationType="fade">
                            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
                                <View style={[styles.modalContent, { maxHeight: 400 }]}>
                                    <TouchableOpacity
                                        onPress={() => setDropdownVisible(false)}
                                        style={styles.setDetailCloseButton}
                                        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.closeButtonText}>×</Text>
                                    </TouchableOpacity>
                                    <Text style={[styles.modalTitle, { marginBottom: 10 }]}>Kies een bord</Text>
                                    {treeItems.length === 0 ? (
                                        <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>Geen borden beschikbaar</Text>
                                    ) : (
                                        <FlatList
                                            data={treeItems}
                                            keyExtractor={(item) => item.id}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedBoardId(item.id);
                                                        setDropdownVisible(false);
                                                    }}
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        padding: 14,
                                                        paddingLeft: 14 + (item.depth * 20),
                                                        borderBottomWidth: 1,
                                                        borderBottomColor: colors.border,
                                                        backgroundColor: selectedBoardId === item.id ? colors.primaryLight + '20' : 'transparent',
                                                    }}
                                                >
                                                    {item.depth > 0 && (
                                                        <MaterialIcons name="subdirectory-arrow-right" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                                                    )}
                                                    <Text style={{
                                                        color: colors.text,
                                                        fontSize: 16,
                                                        fontWeight: selectedBoardId === item.id ? 'bold' : 'normal',
                                                    }}>
                                                        {item.title}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
