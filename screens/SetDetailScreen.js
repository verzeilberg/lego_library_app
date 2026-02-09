import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { globalStyles } from '../styles';
import Config from '../config/config';

import {
    handleSubmitGetSet,
    handleSubmitDeleteSetFromSetList,
} from "../components/Apicalls";

import RatingStars, { selectMultipleImage } from "../components/Functions";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SetDetailScreen({ route, navigation, setGlobalError, setGlobalLoading }) {
    const { item, bordId } = route.params;

    const flatListRef = useRef(null);

    const [set, setSet] = useState(null); // start null to avoid undefined renders
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [personalRating, setPersonalRating] = useState(3);
    const [rating, setRating] = useState(3);

    const setIdentifier = item?.id ?? item?.baseNumber ?? item?.number;

    const [imageHeight, setImageHeight] = useState(0);

    // ======================
    // LOAD SET
    // ======================
    const loadSet = useCallback(async () => {
        if (!setIdentifier) return;

        setGlobalLoading(true);

        try {
            const updatedSet = await handleSubmitGetSet(
                setIdentifier,
                bordId,
                setGlobalError,
                setGlobalLoading
            );

            if (updatedSet) {
                setSet({
                    images: updatedSet.images || [],
                    setMinifigs: updatedSet.setMinifigs || [],
                    setParts: updatedSet.setParts || [],
                    showParts: updatedSet.showParts ?? true,
                    showMinifigs: updatedSet.showMinifigs ?? true,
                    number: updatedSet.number || '',
                    name: updatedSet.name || '',
                    themeName: updatedSet.themeName || '',
                    year: updatedSet.year || '',
                    numParts: updatedSet.numParts || '',
                    description: updatedSet.description || '',
                    personalRating: updatedSet.personalRating || 0,
                    rating: updatedSet.rating || 0,
                });
                setCurrentImageIndex(0);
                setPersonalRating(updatedSet.personalRating || 0);
                setRating(updatedSet.rating || 0);
            }
        } catch (err) {
            console.error(err);
            setGlobalError("Failed to load set.");
        } finally {
            setGlobalLoading(false);
        }
    }, [setIdentifier, bordId, setGlobalError, setGlobalLoading]);

    useFocusEffect(
        useCallback(() => {
            loadSet();
        }, [loadSet])
    );

    // ======================
    // DYNAMIC SLIDES (memoized)
    // ======================
    const slides = React.useMemo(() => {
        if (!set) return [{ id: 'details', title: 'Set Details' }];
        return [
            { id: 'details', title: 'Set Details' },
            ...(set.showMinifigs ? [{ id: 'minifigs', title: 'Minifigs' }] : []),
            ...(set.showParts ? [{ id: 'parts', title: 'Parts' }] : []),
        ];
    }, [set]);

    // clamp index if slides shrink
    useEffect(() => {
        if (currentSlide >= slides.length) {
            const newIndex = slides.length - 1;
            setCurrentSlide(newIndex);
            flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
        }
    }, [slides.length, currentSlide]);

    // ======================
    // IMAGE UPLOAD REFRESH
    // ======================
    const handleAddImages = async () => {
        if (!set) return;

        const result = await selectMultipleImage(
            set.number,
            bordId,
            setGlobalError,
            setGlobalLoading
        );

        if (result?.cancelled) return;

        setGlobalLoading(true);

        try {
            const updatedSet = await handleSubmitGetSet(
                setIdentifier,
                bordId,
                setGlobalError,
                setGlobalLoading
            );

            if (updatedSet?.images?.length) {
                const refreshedImages = updatedSet.images.map(img => `${img}?t=${Date.now()}`);
                setSet(prev => ({ ...prev, ...updatedSet, images: refreshedImages }));
                setCurrentImageIndex(0);
            }
        } catch (err) {
            console.error(err);
            setGlobalError("Failed to refresh images.");
        } finally {
            setGlobalLoading(false);
        }
    };

    // ======================
    // IMAGE NAVIGATION
    // ======================
    const handlePrevImage = () => setCurrentImageIndex(prev =>
        prev === 0 ? (set?.images.length ?? 1) - 1 : prev - 1
    );

    const handleNextImage = () => setCurrentImageIndex(prev =>
        (prev + 1) % (set?.images.length ?? 1)
    );

    if (!set) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading set...</Text>
            </View>
        );
    }

    // ======================
    // RENDER
    // ======================
    return (
        <View style={{ flex: 1 }}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle} numberOfLines={1}>{set.name}</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity onPress={handleAddImages}>
                        <MaterialIcons name="add-photo-alternate" size={28} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleSubmitDeleteSetFromSetList(
                            set.number,
                            bordId,
                            setGlobalError,
                            setGlobalLoading,
                            navigation
                        )}
                    >
                        <MaterialIcons name="delete" size={28} color="red" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* DOTS */}
            <View style={styles.dots}>
                {slides.map((slide, index) => (
                    <View
                        key={slide.id}
                        style={[
                            styles.dot,
                            currentSlide === index ? { backgroundColor: 'black' } : { backgroundColor: 'lightgray' }
                        ]}
                    />
                ))}
            </View>

            {/* SLIDES */}
            <FlatList
                ref={flatListRef}
                data={slides}
                extraData={slides.length}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onMomentumScrollEnd={event => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentSlide(index);
                }}
                renderItem={({ item: slideItem }) => (
                    <View style={{ width, padding: 16 }}>
                            <Text style={[globalStyles.titleSetText, { fontSize: 18 }]}>
                                {slideItem.title}
                            </Text>

                        {/* DETAILS */}
                        {slideItem.id === 'details' && (
                            <>
                                {set.images?.length > 0 && (
                                    <View style={[styles.imageContainer]}>
                                        <Image
                                            key={set.images[currentImageIndex]}
                                            source={{ uri: Config.API_BASE_URL + set.images[currentImageIndex] }}
                                            style={{ width: '100%', height: imageHeight }}
                                            resizeMode="contain"
                                            onLoad={(event) => {
                                                const { width, height } = event.nativeEvent.source;
                                                const screenWidth = Dimensions.get('window').width - 32; // 16 padding each side
                                                const scaledHeight = (screenWidth / width) * height;
                                                setImageHeight(scaledHeight);
                                            }}
                                        />
                                        {set.images.length > 1 && (
                                            <>
                                                <TouchableOpacity style={styles.leftArrow} onPress={handlePrevImage}>
                                                    <FontAwesome name="chevron-left" size={32} color="white" />
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.rightArrow} onPress={handleNextImage}>
                                                    <FontAwesome name="chevron-right" size={32} color="white" />
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>

                                )}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                    <Text style={{ fontWeight: 'bold', marginRight: 8 }}>
                                        Rating
                                    </Text>

                                    <RatingStars
                                        rating={rating}    // general rating
                                        readonly
                                        size={20}
                                        showLabel={false}
                                        style={{ margin: 0, padding: 0 }}
                                    />
                                </View>
                                <View
                                    style={{
                                        height: 2,           // thickness of the line
                                        backgroundColor: 'black',
                                        width: '100%',       // full width
                                        marginVertical: 8,   // spacing above/below
                                    }}
                                />
                                <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold', marginTop: 5 }}>Number: </Text>{set.number}</Text>
                                <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Theme: </Text>{set.themeName}</Text>
                                <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Year: </Text>{set.year}</Text>
                                <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Total parts: </Text>{set.numParts}</Text>
                                <RatingStars
                                    rating={personalRating}
                                    onChange={setPersonalRating}
                                    setId={set.number}
                                    setGlobalLoading={setGlobalLoading}
                                    setGlobalError={setGlobalError}
                                    setOverallRating={setRating} // <-- pass the setter for general rating
                                />
                                <Text style={globalStyles.setText}>{set.description}</Text>
                            </>
                        )}

                        {/* MINIFIGS */}
                        {slideItem.id === 'minifigs' && (
                            <FlatList
                                data={set.setMinifigs || []}
                                keyExtractor={item => item?.id?.toString() ?? Math.random().toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.listItem}>
                                        <Image source={{ uri: item?.minifig?.imageUrl || '' }} style={styles.image} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Nr. </Text>{item?.id}</Text>
                                            <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Name: </Text>{item?.minifig?.name}</Text>
                                            <Text style={[globalStyles.setText, { marginTop: 4 }]}><Text style={{ fontWeight: 'bold' }}>Quantity: </Text>{item?.quantity}</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        )}

                        {/* PARTS */}
                        {slideItem.id === 'parts' && (
                            <FlatList
                                data={set.setParts || []}
                                keyExtractor={item => item?.id?.toString() ?? Math.random().toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.listItem}>
                                        <Image source={{ uri: item?.partColor?.part?.imgUrl || '' }} style={styles.image} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Nr. </Text>{item?.partColor?.part?.partNumber}</Text>
                                            <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Title: </Text>{item?.partColor?.part?.name}</Text>
                                            <Text style={globalStyles.setText}><Text style={{ fontWeight: 'bold' }}>Color: </Text>{item?.partColor?.color?.name}</Text>
                                            <Text style={[globalStyles.setText, { marginTop: 4 }]}><Text style={{ fontWeight: 'bold' }}>Quantity: </Text>{item?.quantity}</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        flexShrink: 1,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        marginBottom: 16,
        overflow: 'hidden',   // ensures borderRadius clips the image
    },
    mainImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    leftArrow: {
        position: 'absolute',
        top: '50%',
        left: 10,
        transform: [{ translateY: -25 }],
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightArrow: {
        position: 'absolute',
        top: '50%',
        right: 10,
        transform: [{ translateY: -25 }],
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingVertical: 3,
        alignItems: 'center',
        borderTopColor: '#808080',
        borderTopWidth: 1,
        borderRadius: 5,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 10,
    },
});
