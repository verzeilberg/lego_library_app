import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Modal,
    ActivityIndicator,
} from 'react-native';
import {globalStyles} from '../../../styles';
import Config from '../../../config/config';

import {
    handleSubmitGetSet,
    handleSubmitDeleteSetFromSetList,
    savePartState,
} from "../../../components/Apicalls";

import {selectMultipleImage} from "../../../components/Functions";
import RatingStars from "../../../components/rating/RatingStars";
import {useFocusEffect} from "@react-navigation/native";
import {MaterialIcons, FontAwesome} from '@expo/vector-icons';

const {width} = Dimensions.get('window');

export default function SetDetailScreen({route, navigation, setGlobalError, setGlobalLoading}) {
    const {item, bordId} = route.params;

    const flatListRef = useRef(null);

    const [set, setSet] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const setIdentifier = item?.id ?? item?.baseNumber ?? item?.number;

    // Modal state
    const [selectedPart, setSelectedPart] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [savingPart, setSavingPart] = useState(false);

    const part = selectedPart ?? {missingQuantity: 0, damagedQuantity: 0, discolouredQuantity: 0};

    // Modal update logic
    const updateSelectedPart = useCallback((type, delta) => {
        if (!selectedPart) return;
        const total =
            (selectedPart.missingQuantity ?? 0) +
            (selectedPart.damagedQuantity ?? 0) +
            (selectedPart.discolouredQuantity ?? 0);
        const required = selectedPart.quantity ?? 0;

        if (delta > 0 && total >= required) return;
        if (delta < 0 && (Number(selectedPart[type]) || 0) <= 0) return;
        setSelectedPart({
            ...selectedPart,
            [type]: (Number(selectedPart[type]) || 0) + delta,
            setId: set.number,
            bordId: bordId,
        });
    }, [selectedPart, set, bordId]);

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
                    specificParts: updatedSet.specificParts || '',
                    totalQuantity: updatedSet.totalQuantity || '',
                    totalMiniFigsParts: updatedSet.totalMiniFigsParts || '',
                    description: updatedSet.description || '',
                    personalRating: updatedSet.personalRating || 0,
                    rating: updatedSet.rating || 0,
                    isComplete: updatedSet.isComplete || false,
                    hasInstructions: updatedSet.hasInstructions || false,
                });
                setCurrentImageIndex(0);
            }
        } catch (err) {
            console.error(err);
            setGlobalError("Failed to load set.");
        } finally {
            setGlobalLoading(false);
        }
    }, [setIdentifier, bordId, setGlobalError, setGlobalLoading]);

    useFocusEffect(
        useCallback(() => { loadSet(); }, [loadSet])
    );

    // ======================
    // DYNAMIC SLIDES (memoized)
    // ======================
    const slides = React.useMemo(() => {
        if (!set) return [{id: 'details', title: 'Set Details'}];
        return [
            {id: 'details', title: 'Set Details'},
            ...(set.showMinifigs && set.setMinifigs?.length ? [{id: 'minifigs', title: 'Minifigs'}] : []),
            ...(set.showParts && set.setParts?.length ? [{
                id: 'parts',
                title: 'Parts',
                intro: 'Click on a part text to add them to the missing, broken or discoloured list.'
            }] : []),
        ];
    }, [set?.showMinifigs, set?.setMinifigs?.length, set?.showParts, set?.setParts?.length]);

    // clamp index if slides shrink
    useEffect(() => {
        if (currentSlide >= slides.length) {
            const newIndex = slides.length - 1;
            setCurrentSlide(newIndex);
            flatListRef.current?.scrollToIndex({index: newIndex, animated: false});
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
                setSet(prev => ({...prev, ...updatedSet, images: refreshedImages}));
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

    // ======================
    // LIST RENDER ITEMS
    // ======================
    const renderMinifigItem = useCallback(({item}) => (
        <View style={globalStyles.listItem}>
            <Image
                source={item?.imageUrl ? {uri: item.imageUrl} : require('../../../assets/images/no-minifig.png')}
                style={globalStyles.image}
            />
            <View style={{flex: 1}}>
                <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Nr. </Text>{item?.id}</Text>
                <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Name: </Text>{item?.name}</Text>
                <Text style={[globalStyles.setText, {marginTop: 4}]}><Text style={{fontWeight: 'bold'}}>Quantity: </Text>{item?.quantity}</Text>
            </View>
        </View>
    ), []);

    const renderPartItem = useCallback(({item}) => (
        <View style={globalStyles.listItem}>
            {item?.imageUrl ? (
                <Image source={{uri: item.imageUrl}} style={globalStyles.image}/>
            ) : null}
            <TouchableOpacity onPress={() => {
                setSelectedPart(item);
                setModalVisible(true);
            }}>
                <View style={{flex: 1}}>
                    <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Nr. </Text>{item?.partNumber}</Text>
                    <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Title: </Text>{item?.name}</Text>
                    <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Color: </Text>{item?.colorName}</Text>
                    <Text style={[globalStyles.setText, {marginTop: 4}]}><Text style={{fontWeight: 'bold'}}>Quantity: </Text>{item?.quantity}</Text>
                </View>
            </TouchableOpacity>
        </View>
    ), []);

    if (!set) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>Loading set...</Text>
            </View>
        );
    }

    // ======================
    // RENDER
    // ======================
    return (
        <View style={{flex: 1}}>

            {/* HEADER */}
            <View style={globalStyles.header}>
                <Text style={globalStyles.headerTitle} numberOfLines={1}>{set.name}</Text>
                <View style={globalStyles.headerIcons}>
                    <TouchableOpacity onPress={handleAddImages}>
                        <MaterialIcons name="add-photo-alternate" size={28} color="green"/>
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
                        <MaterialIcons name="delete" size={28} color="red"/>
                    </TouchableOpacity>
                </View>
            </View>

            {/* DOTS */}
            <View style={globalStyles.dots}>
                {slides.map((slide, index) => (
                    <View
                        key={slide.id}
                        style={[
                            globalStyles.dot,
                            currentSlide === index ? {backgroundColor: 'black'} : {backgroundColor: 'lightgray'}
                        ]}
                    />
                ))}
            </View>

            {/* SLIDES */}
            <FlatList
                ref={flatListRef}
                data={slides}
                extraData={set}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onMomentumScrollEnd={event => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentSlide(index);
                }}
                renderItem={({item: slideItem}) => (
                    <View style={{width, padding: 16}}>
                        <Text style={[globalStyles.titleSetText, {fontSize: 18}]}>
                            {slideItem.title}
                        </Text>
                        <Text style={{fontSize: 14, marginBottom: 10}}>
                            {slideItem.intro}
                        </Text>

                        {/* DETAILS */}
                        {slideItem.id === 'details' && (
                            <>
                                {set.images?.length > 0 && (
                                    <View style={globalStyles.imageContainer}>
                                        <Image
                                            source={{uri: Config.API_BASE_URL + set.images[currentImageIndex]}}
                                            style={{width: width - 32, height: (width - 32) * (9 / 16)}}
                                            resizeMode="contain"
                                        />
                                        {set.images.length > 1 && (
                                            <>
                                                <TouchableOpacity style={[globalStyles.arrow, {left: 10}]} onPress={handlePrevImage} delayPressIn={0}>
                                                    <FontAwesome name="chevron-left" size={32} color="white"/>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[globalStyles.arrow, {right: 10}]} onPress={handleNextImage} delayPressIn={0}>
                                                    <FontAwesome name="chevron-right" size={32} color="white"/>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                )}
                                <View style={globalStyles.ratingRow}>
                                    <Text style={{fontWeight: 'bold', marginRight: 8}}>Rating</Text>
                                    <RatingStars
                                        rating={set.rating}
                                        readonly
                                        size={20}
                                        showLabel={false}
                                        style={{margin: 0, padding: 0}}
                                    />
                                </View>
                                <View style={globalStyles.divider}/>
                                <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold', marginTop: 5}}>Number: </Text>{set.number}</Text>
                                <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Theme: </Text>{set.themeName}</Text>
                                <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Year: </Text>{set.year}</Text>
                                <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Total parts: </Text>{set.numParts}</Text>
                                <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Specific parts: </Text>{set.specificParts}</Text>
                                <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Total quantity: </Text>{set.totalQuantity}</Text>
                                <Text style={globalStyles.setText}><Text style={{fontWeight: 'bold'}}>Total mini figs parts: </Text>{set.totalMiniFigsParts}</Text>
                                <RatingStars
                                    rating={set.personalRating}
                                    onChange={(val) => setSet(prev => ({...prev, personalRating: val}))}
                                    setId={set.number}
                                    setGlobalLoading={setGlobalLoading}
                                    setGlobalError={setGlobalError}
                                    setOverallRating={(val) => setSet(prev => ({...prev, rating: val}))}
                                />
                                <View style={globalStyles.inputContainer}>
                                    <Text style={globalStyles.setText}>
                                        <Text style={{fontWeight: 'bold'}}>Complete: </Text>
                                    </Text>
                                    <MaterialIcons
                                        name={set.isComplete ? 'check-circle' : 'cancel'}
                                        size={20}
                                        color={set.isComplete ? 'green' : 'red'}
                                        style={{marginLeft: 4}}
                                    />
                                </View>
                                <View style={globalStyles.inputContainer}>
                                    <Text style={globalStyles.setText}>
                                        <Text style={{fontWeight: 'bold'}}>Instructions: </Text>
                                    </Text>
                                    <MaterialIcons
                                        name={set.hasInstructions ? 'check-circle' : 'cancel'}
                                        size={20}
                                        color={set.hasInstructions ? 'green' : 'red'}
                                        style={{marginLeft: 4}}
                                    />
                                </View>
                                <Text style={globalStyles.setText}>{set.description}</Text>
                            </>
                        )}

                        {/* MINIFIGS */}
                        {slideItem.id === 'minifigs' && (
                            <FlatList
                                data={set.setMinifigs || []}
                                keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
                                renderItem={renderMinifigItem}
                            />
                        )}

                        {/* PARTS */}
                        {slideItem.id === 'parts' && (
                            <FlatList
                                data={set.setParts || []}
                                keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
                                renderItem={renderPartItem}
                            />
                        )}
                    </View>
                )}
            />

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={globalStyles.setDetailCloseButton}
                            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                            activeOpacity={0.7}
                        >
                            <Text style={globalStyles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                        {selectedPart && (
                            <>
                                <Text style={globalStyles.modalTitle}>{selectedPart.partNumber} - {selectedPart.name}</Text>

                                {[
                                    {key: "missingQuantity", label: "Missing"},
                                    {key: "damagedQuantity", label: "Broken"},
                                    {key: "discolouredQuantity", label: "Discoloured"},
                                ].map(({key, label}) => (
                                    <View key={key} style={globalStyles.counterRow}>
                                        <Text style={{width: 120}}>{label}</Text>

                                        <TouchableOpacity style={globalStyles.counterBtn} delayPressIn={0} onPress={() => updateSelectedPart(key, -1)}>
                                            <Text style={globalStyles.counterBtnText}>−</Text>
                                        </TouchableOpacity>

                                        <Text style={globalStyles.counterValue}>
                                            {Number(part[key] ?? 0)}
                                        </Text>

                                        <TouchableOpacity style={globalStyles.counterBtn} delayPressIn={0} onPress={() => updateSelectedPart(key, 1)}>
                                            <Text style={globalStyles.counterBtnText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {savingPart
                                    ? <ActivityIndicator/>
                                    : (
                                        <View style={globalStyles.container}>
                                            <TouchableOpacity
                                                style={globalStyles.button}
                                                onPress={() => savePartState(selectedPart, setSavingPart, setSet, setModalVisible, setGlobalError)}
                                            >
                                                <Text style={globalStyles.text}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
