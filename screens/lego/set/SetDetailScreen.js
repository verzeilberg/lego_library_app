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
import {useStyles, useTheme} from '../../../styles';
import Config from '../../../config/config';

import {
    handleSubmitGetSet,
    handleSubmitDeleteSetFromSetList,
    handleMoveSet,
    savePartState,
    deleteSetImage,
} from "../../../components/Apicalls";

import {selectMultipleImage} from "../../../components/Functions";
import MoveModal from "../../../components/modals/MoveModal";
import RatingStars from "../../../components/rating/RatingStars";
import {useFocusEffect} from "@react-navigation/native";
import {MaterialIcons, FontAwesome} from '@expo/vector-icons';
import {File, Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import ErrorBanner from '../../../components/ui/ErrorBanner';

const {width} = Dimensions.get('window');

const FILTER_OPTIONS = [
    {key: 'missingQuantity', label: 'Missing'},
    {key: 'damagedQuantity', label: 'Broken'},
    {key: 'discolouredQuantity', label: 'Discoloured'},
];

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

export default function SetDetailScreen({route, navigation, setGlobalError, setGlobalLoading}) {
    const styles = useStyles();
    const { colors } = useTheme();
    const {item, bordId} = route.params;

    const flatListRef = useRef(null);
    const partsListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const AnimatedFlatList = useRef(Animated.createAnimatedComponent(FlatList)).current;

    const [set, setSet] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const setIdentifier = item?.id ?? item?.baseNumber ?? item?.number;

    // Parts filter state
    const [partsFilter, setPartsFilter] = useState([]);

    const togglePartsFilter = useCallback((key) => {
        setPartsFilter(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    }, []);

    // Parts sort state
    const [partsSort, setPartsSort] = useState({field: 'partNumber', direction: 'asc'});
    const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
    const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);

    const filterLabel = 'Filter';

    const currentSortLabel = SORT_OPTIONS.find(o => o.field === partsSort.field && o.direction === partsSort.direction)?.label ?? 'Sort';

    // Modal state
    const [selectedPart, setSelectedPart] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [savingPart, setSavingPart] = useState(false);

    const [moveModalVisible, setMoveModalVisible] = useState(false);

    const handleMoveSetToBoard = useCallback((targetListId) => {
        handleMoveSet(bordId, set.number, targetListId, setGlobalError, setGlobalLoading, () => {
            navigation.goBack();
        });
    }, [bordId, set, setGlobalError, setGlobalLoading, navigation]);

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
    // MISSING PARTS EXPORT
    // ======================
    const missingParts = React.useMemo(() =>
        (set?.setParts || []).filter(p => (p.missingQuantity || 0) > 0),
        [set?.setParts]
    );

    const exportMissingCsv = async () => {
        try {
            if (missingParts.length === 0) {
                Alert.alert('No missing parts', 'There are no missing parts to export.');
                return;
            }
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('Sharing not available', 'This device does not support file sharing.');
                return;
            }
            const header = 'Part Number,Name,Color,Quantity,Missing,Broken,Discoloured';
            const rows = missingParts.map(p =>
                [
                    p.partNumber || '',
                    `"${(p.name || '').replace(/"/g, '""')}"`,
                    `"${(p.colorName || '').replace(/"/g, '""')}"`,
                    p.quantity || 0,
                    p.missingQuantity || 0,
                    p.damagedQuantity || 0,
                    p.discolouredQuantity || 0,
                ].join(',')
            );
            const csv = [header, ...rows].join('\n');
            const file = new File(Paths.cache, `${set.number}-missing-parts.csv`);
            file.write(csv);
            await Sharing.shareAsync(file.uri, {mimeType: 'text/csv', dialogTitle: 'Export missing parts'});
        } catch (err) {
            Alert.alert('Export failed', err.message);
        }
    };

    const exportMissingExcel = async () => {
        if (missingParts.length === 0) {
            Alert.alert('No missing parts', 'There are no missing parts to export.');
            return;
        }
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert('Sharing not available', 'This device does not support file sharing.');
            return;
        }
        try {
            setGlobalLoading(true);

            const headers = ['Image', 'Part Nr.', 'Name', 'Color', 'Quantity', 'Missing', 'Broken', 'Discoloured'];
            const rows = missingParts.map(p => [
                '',
                p.partNumber || '',
                p.name || '',
                p.colorName || '',
                p.quantity || 0,
                p.missingQuantity || 0,
                p.damagedQuantity || 0,
                p.discolouredQuantity || 0,
            ]);

            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

            missingParts.forEach((p, i) => {
                if (p.imageUrl && p.imageUrl.startsWith('http')) {
                    const cellRef = XLSX.utils.encode_cell({r: i + 1, c: 0});
                    ws[cellRef] = {f: `IMAGE("${p.imageUrl}")`};
                }
            });

            ws['!cols'] = [
                {wch: 15},
                {wch: 12},
                {wch: 30},
                {wch: 20},
                {wch: 10},
                {wch: 10},
                {wch: 10},
                {wch: 15},
            ];
            ws['!rows'] = [
                {hpt: 20},
                ...missingParts.map(() => ({hpt: 60})),
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Missing Parts');

            const xlsxBytes = XLSX.write(wb, {type: 'array', bookType: 'xlsx'});
            const file = new File(Paths.cache, `${set.number}-missing-parts.xlsx`);
            file.write(new Uint8Array(xlsxBytes));

            await Sharing.shareAsync(file.uri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Export missing parts',
            });
        } catch (err) {
            Alert.alert('Export failed', err.message);
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleExport = () => Alert.alert(
        'Export missing parts',
        'Choose export format',
        [
            {text: 'CSV', onPress: exportMissingCsv},
            {text: 'Excel (with images)', onPress: exportMissingExcel},
            {text: 'Annuleer', style: 'cancel'},
        ]
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

        if (result?.cancelled || !result?.uploaded) return;

        setGlobalLoading(true);

        try {
            const updatedSet = await handleSubmitGetSet(
                setIdentifier,
                bordId,
                setGlobalError,
                setGlobalLoading
            );

            if (updatedSet?.images?.length) {
                const refreshedImages = updatedSet.images.map(img => ({...img, path: `${img.path}?t=${Date.now()}`}));
                setSet(prev => ({...prev, ...updatedSet, images: refreshedImages}));
                setCurrentImageIndex(refreshedImages.length - 1);
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
    const handlePrevImage = useCallback(() => setCurrentImageIndex(prev =>
        prev === 0 ? (set?.images.length ?? 1) - 1 : prev - 1
    ), [set?.images.length]);

    const handleNextImage = useCallback(() => setCurrentImageIndex(prev =>
        (prev + 1) % (set?.images.length ?? 1)
    ), [set?.images.length]);

    // ======================
    // LIST RENDER ITEMS
    // ======================
    const minifigsWithImages = React.useMemo(() =>
        (set?.setMinifigs || [])
            .filter(m => m.imageUrl)
            .map(m => ({imageUrl: m.imageUrl, label: m.id})),
        [set?.setMinifigs]
    );

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
                <TouchableOpacity onPress={() => openImagePreview(item.imageUrl?.startsWith('http') ? item.imageUrl : Config.API_BASE_URL + item.imageUrl)}>
                    <Image source={{uri: item.imageUrl?.startsWith('http') ? item.imageUrl : Config.API_BASE_URL + item.imageUrl}} style={styles.image}/>
                </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.flex1} onPress={() => {
                setSelectedPart(item);
                setModalVisible(true);
            }}>
                <View style={styles.flex1}>
                    <Text style={styles.setText}><Text style={styles.bold}>Nr. </Text>{item?.partNumber}</Text>
                    <Text style={styles.setText}><Text style={styles.bold}>Title: </Text>{item?.name}</Text>
                    <Text style={styles.setText}><Text style={styles.bold}>Color: </Text>{item?.colorName}</Text>
                    <Text style={[styles.setText, styles.setDetailQuantityText]}><Text style={styles.bold}>Quantity: </Text>{item?.quantity}</Text>
                    {(item?.missingQuantity || 0) > 0 && (
                        <Text style={[styles.setText, styles.textMissing]}><Text style={styles.bold}>Missing: </Text>{item.missingQuantity}</Text>
                    )}
                    {(item?.damagedQuantity || 0) > 0 && (
                        <Text style={[styles.setText, styles.textBroken]}><Text style={styles.bold}>Broken: </Text>{item.damagedQuantity}</Text>
                    )}
                    {(item?.discolouredQuantity || 0) > 0 && (
                        <Text style={[styles.setText, styles.textDiscoloured]}><Text style={styles.bold}>Discoloured: </Text>{item.discolouredQuantity}</Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    ), [openImagePreview]);

    const hasDefectiveParts = React.useMemo(() =>
        (set?.setParts || []).some(p =>
            (p.missingQuantity || 0) > 0 || (p.damagedQuantity || 0) > 0 || (p.discolouredQuantity || 0) > 0
        ), [set?.setParts]);

    const sortedFilteredParts = React.useMemo(() => {
        return [...(set?.setParts || [])].filter(p =>
            partsFilter.length === 0 || partsFilter.some(key => (p[key] || 0) > 0)
        ).sort((a, b) => {
            const {field, direction} = partsSort;
            const aVal = field === 'quantity' ? (a[field] ?? 0) : (a[field] ?? '').toString().toLowerCase();
            const bVal = field === 'quantity' ? (b[field] ?? 0) : (b[field] ?? '').toString().toLowerCase();
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [set?.setParts, partsFilter, partsSort]);

    const previewPartsWithImages = React.useMemo(() => {
        const result = sortedFilteredParts
            .filter(p => p.imageUrl)
            .map(p => ({imageUrl: p.imageUrl, label: p.partNumber}));
        previewItemsRef.current = result;
        return result;
    }, [sortedFilteredParts]);

    const navigateImagePreview = useCallback((delta) => {
        const list = previewItemsRef.current;
        const next = imagePreviewIndex + delta;
        if (next < 0 || next >= list.length) return;
        setImagePreviewIndex(next);
        loadImageSize(list[next].imageUrl);
    }, [imagePreviewIndex, loadImageSize]);

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
                        <TouchableOpacity style={[styles.iconButton, { borderColor: 'black' }]} onPress={handleExport}>
                            <MaterialIcons name="download" size={20} color="black"/>
                        </TouchableOpacity>
                    )}
                    {slides[currentSlide]?.id === 'details' && (
                        <TouchableOpacity style={[styles.iconButton, { borderColor: 'green' }]} onPress={handleAddImages}>
                            <MaterialIcons name="add-photo-alternate" size={20} color="green"/>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.iconButton, { borderColor: 'orange' }]} onPress={() => setMoveModalVisible(true)}>
                        <MaterialIcons name="drive-file-move" size={20} color="orange"/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconButton, { borderColor: 'red' }]}
                        onPress={() => handleSubmitDeleteSetFromSetList(
                            set.number,
                            bordId,
                            setGlobalError,
                            setGlobalLoading,
                            navigation
                        )}
                    >
                        <MaterialIcons name="delete" size={20} color="red"/>
                    </TouchableOpacity>
                </View>
            </View>

            {/* DOTS */}
            <View style={styles.dots}>
                {slides.map((slide, index) => {
                    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                    return (
                        <Animated.View
                            key={slide.id}
                            style={[
                                styles.dot,
                                {
                                    width: scrollX.interpolate({inputRange, outputRange: [8, 18, 8], extrapolate: 'clamp'}),
                                    opacity: scrollX.interpolate({inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp'}),
                                    backgroundColor: 'black',
                                },
                            ]}
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
                                        {set.images[currentImageIndex].id !== null && (
                                            <TouchableOpacity
                                                style={styles.imageDeleteIcon}
                                                onPress={async () => {
                                                    const imgId = set.images[currentImageIndex].id;
                                                    const ok = await deleteSetImage(imgId, setGlobalError);
                                                    if (ok) {
                                                        setSet(prev => {
                                                            const updated = prev.images.filter(img => img.id !== imgId);
                                                            return {...prev, images: updated};
                                                        });
                                                        setCurrentImageIndex(prev => Math.max(0, prev - 1));
                                                    }
                                                }}
                                            >
                                                <MaterialIcons name="delete" size={24} color="white"/>
                                            </TouchableOpacity>
                                        )}
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
                                <RatingStars
                                    rating={set.personalRating}
                                    onChange={(val) => setSet(prev => ({...prev, personalRating: val}))}
                                    setId={set.number}
                                    setGlobalLoading={setGlobalLoading}
                                    setGlobalError={setGlobalError}
                                    setOverallRating={(val) => setSet(prev => ({...prev, rating: val}))}
                                />
                                <View style={styles.inputContainer}>
                                    <Text style={styles.setText}>
                                        <Text style={styles.bold}>Complete: </Text>
                                    </Text>
                                    <MaterialIcons
                                        name={set.isComplete && !hasDefectiveParts ? 'check-circle' : 'cancel'}
                                        size={20}
                                        color={set.isComplete && !hasDefectiveParts ? 'green' : 'red'}
                                        style={styles.setDetailStatusIcon}
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.setText}>
                                        <Text style={styles.bold}>Instructions: </Text>
                                    </Text>
                                    <MaterialIcons
                                        name={set.hasInstructions ? 'check-circle' : 'cancel'}
                                        size={20}
                                        color={set.hasInstructions ? 'green' : 'red'}
                                        style={styles.setDetailStatusIcon}
                                    />
                                </View>
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
                                        onPress={() => setFilterDropdownVisible(true)}
                                        style={[styles.setDetailDropdownBtn, {borderColor: partsFilter.length > 0 ? colors.primaryLight : colors.borderDark}]}
                                    >
                                        <MaterialIcons name="filter-list" size={16} color={partsFilter.length > 0 ? colors.primaryLight : colors.textSecondary}/>
                                        <Text style={[styles.setDetailDropdownBtnText, {color: partsFilter.length > 0 ? colors.primaryLight : colors.textSecondary}]} numberOfLines={1}>{filterLabel}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setSortDropdownVisible(true)}
                                        style={[styles.setDetailDropdownBtn, styles.setDetailDropdownBtnSort]}
                                    >
                                        <MaterialIcons name="sort" size={16} color="#555"/>
                                        <Text style={[styles.setDetailDropdownBtnText, styles.setDetailDropdownBtnSortText]}>{currentSortLabel}</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={sortedFilteredParts}
                                    ref={partsListRef}
                                    keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
                                    renderItem={renderPartItem}
                                />
                            </>
                        )}

                    </View>
                )}
            />

            {/* Filter dropdown */}
            <Modal visible={filterDropdownVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterDropdownVisible(false)}>
                    <View style={[styles.modalContent, styles.setDetailDropdownModalContent]}>
                        <TouchableOpacity
                            onPress={() => setFilterDropdownVisible(false)}
                            style={styles.setDetailCloseButton}
                            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, styles.setDetailDropdownModalTitle]}>Filter</Text>
                        {FILTER_OPTIONS.map(option => {
                            const active = partsFilter.includes(option.key);
                            return (
                                <TouchableOpacity
                                    key={option.key}
                                    onPress={() => togglePartsFilter(option.key)}
                                    style={styles.setDetailFilterOption}
                                >
                                    <MaterialIcons
                                        name={active ? 'check-box' : 'check-box-outline-blank'}
                                        size={22}
                                        color={active ? colors.primaryLight : colors.textSecondary}
                                    />
                                    <Text style={styles.setDetailSortOptionText}>{option.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </Modal>

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

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.setDetailCloseButton}
                            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                        {selectedPart && (
                            <>
                                <Text style={styles.modalTitle}>{selectedPart.partNumber} - {selectedPart.name}</Text>

                                {[
                                    {key: "missingQuantity", label: "Missing"},
                                    {key: "damagedQuantity", label: "Broken"},
                                    {key: "discolouredQuantity", label: "Discoloured"},
                                ].map(({key, label}) => (
                                    <View key={key} style={styles.counterRow}>
                                        <Text style={styles.setDetailCounterLabel}>{label}</Text>

                                        <TouchableOpacity style={styles.counterBtn} delayPressIn={0} onPress={() => updateSelectedPart(key, -1)}>
                                            <Text style={styles.counterBtnText}>−</Text>
                                        </TouchableOpacity>

                                        <Text style={styles.counterValue}>
                                            {Number(part[key] ?? 0)}
                                        </Text>

                                        <TouchableOpacity style={styles.counterBtn} delayPressIn={0} onPress={() => updateSelectedPart(key, 1)}>
                                            <Text style={styles.counterBtnText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {savingPart
                                    ? <ActivityIndicator/>
                                    : (
                                        <View style={styles.container}>
                                            <TouchableOpacity
                                                style={styles.button}
                                                onPress={() => savePartState(selectedPart, setSavingPart, setSet, setModalVisible, setGlobalError)}
                                            >
                                                <Text style={[styles.text, {color: '#fff'}]}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <MoveModal
                modalVisible={moveModalVisible}
                setModalVisible={setMoveModalVisible}
                onMove={handleMoveSetToBoard}
                setGlobalError={setGlobalError}
                setGlobalLoading={setGlobalLoading}
                excludeId={bordId}
                title="Verplaats set naar welk bord?"
            />
        </View>
    );
}
