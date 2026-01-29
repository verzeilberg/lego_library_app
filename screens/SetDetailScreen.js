import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { globalStyles } from '../styles';
import Config from '../config/config';
import { handleSubmitDeleteSetFromSetList, handleSubmitGetSet } from "../components/Apicalls";
import { selectMultipleImage } from "../components/Functions";

export default function SetDetailScreen({ route, navigation, setGlobalError, setGlobalLoading }) {
    const { item, bordId } = route.params;
    const [set, setSet] = useState(item);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [images, setImages] = useState(item.images || []);

    // Load set from API
    useEffect(() => {
        const loadSet = async () => {
            setGlobalLoading(true);
            const updatedSet = await handleSubmitGetSet(set.id, bordId, setGlobalError, setGlobalLoading);
            setGlobalLoading(false);

            if (updatedSet) {
                setSet(updatedSet);
                if (updatedSet.images && updatedSet.images.length > 0) {
                    setImages(updatedSet.images);
                    setCurrentImageIndex(0);
                }
            }
        };

        loadSet();
    }, []);

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
    };

    const handleAddImages = async () => {
        const result = await selectMultipleImage(set.number, bordId, setGlobalError, setGlobalLoading);

        if (!result.cancelled && result.uploaded?.length > 0) {
            // Append newly uploaded images to state
            setImages(prev => [...prev, ...result.uploaded]);
            setCurrentImageIndex(prev => prev + (prev.length || 0));

            // Update the full set object as well
            setSet(prevSet => ({
                ...prevSet,
                images: [...(prevSet.images || []), ...result.uploaded],
            }));
        }
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            {/* Title and Actions */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{set.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={handleAddImages}>
                        <MaterialIcons name="add-photo-alternate" size={28} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            handleSubmitDeleteSetFromSetList(
                                set.number,
                                bordId,
                                setGlobalError,
                                setGlobalLoading,
                                navigation
                            )
                        }
                    >
                        <MaterialIcons name="delete" size={28} color="red" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Image Carousel */}
            {images.length > 0 && (
                <View style={{ position: 'relative', width: '100%', height: 350, marginBottom: 16 }}>
                    <Image
                        source={{ uri: Config.API_BASE_URL + images[currentImageIndex] }}
                        style={{ width: '100%', height: '100%', borderRadius: 12 }}
                        resizeMode="cover"
                    />
                    {images.length > 1 && (
                        <>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 10,
                                    transform: [{ translateY: -25 }],
                                    width: 50,
                                    height: 50,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={handlePrevImage}
                            >
                                <FontAwesome name="chevron-left" size={32} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    right: 10,
                                    transform: [{ translateY: -25 }],
                                    width: 50,
                                    height: 50,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={handleNextImage}
                            >
                                <FontAwesome name="chevron-right" size={32} color="white" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}

            {/* Set Details */}
            <Text style={[globalStyles.titleSetText, { marginTop: 16 }]}>{set.number}</Text>
            <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Theme:</Text> {set.themeName}</Text>
            <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Year:</Text> {set.year}</Text>
            <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Total parts:</Text> {set.numParts}</Text>
            <Text style={globalStyles.setText}>{set.description}</Text>

            {/* Parts list */}
            {set.setParts && set.setParts.length > 0 && (
                <FlatList
                    data={set.setParts}
                    keyExtractor={(item) => item.id}
                    style={{ marginTop: 16 }}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                flexDirection: 'row',
                                marginBottom: 8,
                                paddingBottom: 3,
                                paddingTop: 3,
                                alignItems: 'center',
                                borderTopColor: '#808080',
                                borderRadius: 5,
                                borderTopWidth: 1,
                            }}
                        >
                            <Image
                                source={{ uri: item.partColor.part.imgUrl }}
                                style={{ width: 60, height: 60, borderRadius: 12, marginRight: 10 }}
                                resizeMode="cover"
                            />
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Nr. </Text>{item.partColor.part.partNumber}</Text>
                                <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Title: </Text>{item.partColor.part.name}</Text>
                                <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Color: </Text>{item.partColor.color.name}</Text>
                                <Text style={[globalStyles.setText, { marginTop: 4 }]}><Text style={{ fontWeight: 'bold' }}>Quantity: </Text>{item.quantity}</Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}
