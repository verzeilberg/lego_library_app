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
    Alert,
    Animated,
} from 'react-native';
import {useStyles} from '../../../styles';
import Config from '../../../config/config';

import {
    handleSubmitGetSet,
} from "../../../components/Apicalls";

import RatingStars from "../../../components/rating/RatingStars";
import {useFocusEffect} from "@react-navigation/native";
import {MaterialIcons, FontAwesome} from '@expo/vector-icons';
import {File, Paths} from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import ErrorBanner from '../../../components/ui/ErrorBanner';

const {width} = Dimensions.get('window');

export default function PublicSetDetailScreen({route, navigation, setGlobalError, setGlobalLoading}) {
    const styles = useStyles();
    const {item, bordId} = route.params;

    const flatListRef = useRef(null);
    const partsListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const AnimatedFlatList = useRef(Animated.createAnimatedComponent(FlatList)).current;

    const [set, setSet] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const setIdentifier = item?.id ?? item?.baseNumber ?? item?.number;

    // Parts sort state
    const [partsSort, setPartsSort] = useState({field: 'partNumber', direction: 'asc'});
    const [sortDropdownVisible, setSortDropdownVisible] = useState(false);

    const SORT_OPTIONS = [
        {field: 'partNumber', direction: 'asc', label: 'Nr. (Low → High)'},
        {field: 'partNumber', direction: 'desc', label: 'Nr. (High → Low)'},
        {field: 'name', direction: 'asc', label: 'Title (A → Z)'},
        {field: 'name', direction: 'desc', label: 'Title (Z → A)'},
        {field: 'colorName', direction: 'asc', label: 'Color (A → Z)'},
        {field: 'colorName', direction: 'desc', label: 'Color (Z → A)'},
        {field: 'quantity', direction: 'asc', label: 'Quantity (Low → High)'},
        {field: 'quantity', direction: 'desc', label: 'Quantity (High → Low)'},
    ];

    const currentSortLabel = SORT_OPTIONS.find(o => o.field === partsSort.field && o.direction === partsSort.direction)?.label ?? 'Sort';

    // Image preview modal
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [imagePreviewSize, setImagePreviewSize] = useState(null);
    const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
    const previewItemsRef = useRef([]);

    const loadImageSize = useCallback((url) => {
        setImagePreviewSize(null);
        setImagePreviewUrl(url);
        const modalInner = (width * 0.85) - 40;
        Image.getSize(url, (w, h) => {
            const scale = Math.min(1, modalInner / w);
            setImagePreviewSize({width: w * scale, height: h * scale});
        });
    }, []);

    const openImagePreview = useCallback((url, items) => {
        if (items) previewItemsRef.current = items;
        const idx = previewItemsRef.current.findIndex(p => p.imageUrl === url);
        setImagePreviewIndex(idx >= 0 ? idx : 0);
        loadImageSize(url);
    }, [loadImageSize]);

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
                    filePath: updatedSet.filePath || null,
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
                    rating: updatedSet.rating || 0,
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
    // DEFECTIVE PARTS
    // ======================
    const exportDefectiveCsv = async () => {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('Sharing not available', 'This device does not support file sharing.');
                return;
            }
            const header = 'Part Number,Name,Color,Quantity,Missing,Broken,Discoloured';
            const rows = (set.setParts || []).map(p =>
                [p.partNumber, `"${p.name}"`, p.colorId, p.quantity, p.missingQuantity || 0, p.damagedQuantity || 0, p.discolouredQuantity || 0].join(',')
            );
            const csv = [header, ...rows].join('\n');
            const file = new File(Paths.cache, `${set.number}-parts.csv`);
            file.write(csv);
            await Sharing.shareAsync(file.uri, {mimeType: 'text/csv', dialogTitle: 'Export parts'});
        } catch (err) {
            Alert.alert('Export failed', err.message);
        }
    };

    // ======================
    // DYNAMIC SLIDES (memoized)
    // ======================
    const slides = React.useMemo(() => {
        if (!set) return [{id: 'details', title: 'Set Details'}];
        return [
            {id: 'details', title: 'Set Details'},
            ...(set.showMinifigs && set.setMinifigs?.length ? [{id: 'minifigs', title: 'Minifigs'}] : []),
            ...(set.showParts && set.setParts?.length ? [{id: 'parts', title: 'Parts'}] : []),
        ];
    }, [set?.showMinifigs, set?.setMinifigs?.length, set?.showParts, set?.setParts]);

    // clamp index if slides shrink
    useEffect(() => {
        if (currentSlide >= slides.length) {
            const newIndex = slides.length - 1;
            setCurrentSlide(newIndex);
            flatListRef.current?.scrollToIndex({index: newIndex, animated: false});
        }
    }, [slides.length, currentSlide]);

    // ======================
    // IMAGE NAVIGATION
    // ======================
    const handlePrevImage = () => setCurrentImageIndex(prev =>
        prev === 0 ? (set?.images.length ?? 1) - 1 : prev - 1
    );

    const handleNextImage = () => setCurrentImageIndex(prev =>
        (prev + 1) % (set?.images.length ?? 1)
    );

    const sortedParts = React.useMemo(() => {
        const result = [...(set?.setParts || [])].sort((a, b) => {
            const {field, direction} = partsSort;
            const aVal = field === 'quantity' ? (a[field] ?? 0) : (a[field] ?? '').toString().toLowerCase();
            const bVal = field === 'quantity' ? (b[field] ?? 0) : (b[field] ?? '').toString().toLowerCase();
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        previewItemsRef.current = result.filter(p => p.imageUrl).map(p => ({imageUrl: p.imageUrl, label: p.partNumber}));
        return result;
    }, [set?.setParts, partsSort]);

    const minifigsWithImages = React.useMemo(() =>
        (set?.setMinifigs || [])
            .filter(m => m.imageUrl)
            .map(m => ({imageUrl: m.imageUrl, label: m.id})),
        [set?.setMinifigs]
    );

    const navigateImagePreview = useCallback((delta) => {
        const list = previewItemsRef.current;
        const next = imagePreviewIndex + delta;
        if (next < 0 || next >= list.length) return;
        setImagePreviewIndex(next);
        loadImageSize(list[next].imageUrl);
    }, [imagePreviewIndex, loadImageSize]);

    // ======================
    // LIST RENDER ITEMS
    // ======================
    const renderMinifigItem = useCallback(({item}) => (
        <View style={styles.listItem}>
            {item?.imageUrl ? (
                <TouchableOpacity onPress={() => openImagePreview(item.imageUrl, minifigsWithImages)}>
                    <Image source={{uri: item.imageUrl}} style={styles.image}/>
                </TouchableOpacity>
            ) : (
                <Image source={require('../../../assets/images/no-minifig.png')} style={styles.image}/>
            )}
            <View style={styles.flex1}>
                <Text style={styles.setText}><Text style={styles.bold}>Nr. </Text>{item?.id}</Text>
                <Text style={styles.setText}><Text style={styles.bold}>Name: </Text>{item?.name}</Text>
                <Text style={[styles.setText, styles.setDetailQuantityText]}><Text style={styles.bold}>Quantity: </Text>{item?.quantity}</Text>
            </View>
        </View>
    ), [openImagePreview, minifigsWithImages]);

    const renderPartItem = useCallback(({item}) => (
        <View style={styles.listItem}>
            {item?.imageUrl ? (
                <TouchableOpacity onPress={() => openImagePreview(item.imageUrl?.startsWith('http') ? item.imageUrl : Config.API_BASE_URL + item.imageUrl, sortedParts.filter(p => p.imageUrl).map(p => ({imageUrl: p.imageUrl?.startsWith('http') ? p.imageUrl : Config.API_BASE_URL + p.imageUrl, label: p.partNumber})))}>
                    <Image source={{uri: item.imageUrl?.startsWith('http') ? item.imageUrl : Config.API_BASE_URL + item.imageUrl}} style={styles.image}/>
                </TouchableOpacity>
            ) : null}
            <View style={styles.flex1}>
                <Text style={styles.setText}><Text style={styles.bold}>Nr. </Text>{item?.partNumber}</Text>
                <Text style={styles.setText}><Text style={styles.bold}>Title: </Text>{item?.name}</Text>
                <Text style={styles.setText}><Text style={styles.bold}>Color: </Text>{item?.colorName}</Text>
                <Text style={[styles.setText, styles.setDetailQuantityText]}><Text style={styles.bold}>Quantity: </Text>{item?.quantity}</Text>
            </View>
        </View>
    ), [openImagePreview, sortedParts]);

    if (!set) {
        return <View style={styles.setDetailLoadingContainer} />;
    }

    // ======================
    // RENDER
    // ======================
    return (
        <View style={styles.flex1}>

            {/* Error banner */}
            <ErrorBanner />

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle} numberOfLines={1}>{set.name}</Text>
                <View style={styles.headerIcons}>
                    {slides[currentSlide]?.id === 'parts' && (
                        <TouchableOpacity style={[styles.iconButton, { borderColor: 'black' }]} onPress={exportDefectiveCsv}>
                            <MaterialIcons name="download" size={20} color="black"/>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* DOTS */}
            <View style={styles.dots}>
                {slides.map((slide, index) => {
                    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                    const dotWidth = scrollX.interpolate({inputRange, outputRange: [8, 18, 8], extrapolate: 'clamp'});
                    const opacity = scrollX.interpolate({inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp'});
                    return (
                        <Animated.View
                            key={slide.id}
                            style={[styles.dot, {width: dotWidth, opacity, backgroundColor: 'black'}]}
                        />
                    );
                })}
            </View>

            {/* SLIDES */}
            <AnimatedFlatList
                ref={flatListRef}
                data={slides}
                extraData={set}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {x: scrollX}}}],
                    {
                        useNativeDriver: false,
                        listener: event => {
                            const index = Math.floor(event.nativeEvent.contentOffset.x / width + 0.3);
                            const clamped = Math.max(0, Math.min(index, slides.length - 1));
                            if (clamped !== currentSlide) setCurrentSlide(clamped);
                        },
                    }
                )}
                scrollEventThrottle={16}
                renderItem={({item: slideItem}) => (
                    <View style={[styles.setDetailSlideContainer, {width}]}>
                        <Text style={[styles.titleSetText, styles.setDetailSlideTitle]}>
                            {slideItem.title}
                        </Text>
                        <Text style={styles.setDetailSlideIntro}>
                            {slideItem.intro}
                        </Text>

                        {/* DETAILS */}
                        {slideItem.id === 'details' && (
                            <>
                                {set.images?.length > 0 && (
                                    <View style={styles.imageContainer}>
                                        <Image
                                            source={{uri: Config.API_BASE_URL + set.images[currentImageIndex].path}}
                                            style={{width: width - 32, height: (width - 32) * (9 / 16)}}
                                            resizeMode="contain"
                                        />
                                        {set.images.length > 1 && (
                                            <>
                                                <TouchableOpacity style={[styles.arrow, styles.arrowLeft]} onPress={handlePrevImage} delayPressIn={0}>
                                                    <FontAwesome name="chevron-left" size={32} color="black"/>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.arrow, styles.arrowRight]} onPress={handleNextImage} delayPressIn={0}>
                                                    <FontAwesome name="chevron-right" size={32} color="black"/>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                )}
                                <View style={styles.ratingRow}>
                                    <Text style={styles.setDetailRatingLabel}>Rating</Text>
                                    <RatingStars
                                        rating={set.rating}
                                        readonly
                                        size={20}
                                        showLabel={false}
                                        style={styles.setDetailRatingNoMargin}
                                    />
                                </View>
                                <View style={styles.divider}/>
                                <Text style={styles.setText}><Text style={styles.bold}>Number: </Text>{set.number}</Text>
                                <Text style={styles.setText}><Text style={styles.bold}>Theme: </Text>{set.themeName}</Text>
                                <Text style={styles.setText}><Text style={styles.bold}>Year: </Text>{set.year}</Text>
                                <Text style={styles.setText}><Text style={styles.bold}>Total parts: </Text>{set.numParts}</Text>
                                <Text style={styles.setText}><Text style={styles.bold}>Specific parts: </Text>{set.specificParts}</Text>
                                <Text style={styles.setText}><Text style={styles.bold}>Total quantity: </Text>{set.totalQuantity}</Text>
                                <Text style={styles.setText}><Text style={styles.bold}>Total mini figs parts: </Text>{set.totalMiniFigsParts}</Text>
                                <Text style={styles.setText}>{set.description}</Text>
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
                            <>
                                <View style={styles.setDetailToolbar}>
                                    <TouchableOpacity
                                        onPress={() => setSortDropdownVisible(true)}
                                        style={[styles.setDetailDropdownBtn, styles.setDetailDropdownBtnSort]}
                                    >
                                        <MaterialIcons name="sort" size={16} color="#555"/>
                                        <Text style={[styles.setDetailDropdownBtnText, styles.setDetailDropdownBtnSortText]}>{currentSortLabel}</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={sortedParts}
                                    ref={partsListRef}
                                    keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
                                    renderItem={renderPartItem}
                                />
                            </>
                        )}

                    </View>
                )}
            />

            {/* Sort dropdown */}
            <Modal visible={sortDropdownVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortDropdownVisible(false)}>
                    <View style={[styles.modalContent, styles.setDetailDropdownModalContent]}>
                        <TouchableOpacity
                            onPress={() => setSortDropdownVisible(false)}
                            style={styles.setDetailCloseButton}
                            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, styles.setDetailDropdownModalTitle]}>Sort by</Text>
                        {SORT_OPTIONS.map(option => {
                            const active = partsSort.field === option.field && partsSort.direction === option.direction;
                            return (
                                <TouchableOpacity
                                    key={`${option.field}-${option.direction}`}
                                    onPress={() => {
                                        setPartsSort({field: option.field, direction: option.direction});
                                        setSortDropdownVisible(false);
                                        partsListRef.current?.scrollToOffset({offset: 0, animated: false});
                                    }}
                                    style={[styles.setDetailSortOption, active && styles.setDetailSortOptionActive]}
                                >
                                    <Text style={active ? styles.setDetailSortOptionTextBold : styles.setDetailSortOptionText}>{option.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Image preview modal */}
            <Modal visible={!!imagePreviewUrl} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            onPress={() => setImagePreviewUrl(null)}
                            style={styles.setDetailCloseButton}
                            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                        {imagePreviewSize
                            ? <Image
                                source={{uri: imagePreviewUrl}}
                                style={[styles.setDetailPreviewImage, {width: imagePreviewSize.width, height: imagePreviewSize.height}]}
                                resizeMode="contain"
                            />
                            : <ActivityIndicator style={styles.setDetailPreviewLoader}/>
                        }
                        <Text style={styles.setDetailPreviewPartNumber}>
                            {previewItemsRef.current[imagePreviewIndex]?.label}
                        </Text>
                        <View style={styles.setDetailPreviewNavRow}>
                            <TouchableOpacity
                                onPress={() => navigateImagePreview(-1)}
                                disabled={imagePreviewIndex <= 0}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                            >
                                <FontAwesome name="chevron-left" size={24} color={imagePreviewIndex <= 0 ? '#ccc' : '#333'}/>
                            </TouchableOpacity>
                            <Text style={styles.setDetailPreviewNavCounter}>
                                {imagePreviewIndex + 1} / {previewItemsRef.current.length}
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigateImagePreview(1)}
                                disabled={imagePreviewIndex >= previewItemsRef.current.length - 1}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                            >
                                <FontAwesome name="chevron-right" size={24} color={imagePreviewIndex >= previewItemsRef.current.length - 1 ? '#ccc' : '#333'}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}
