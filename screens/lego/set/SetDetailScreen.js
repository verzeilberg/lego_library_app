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
import {globalStyles} from '../../../styles';
import Config from '../../../config/config';

import {
    handleSubmitGetSet,
    handleSubmitDeleteSetFromSetList,
    savePartState,
    deleteSetImage,
} from "../../../components/Apicalls";

import {selectMultipleImage} from "../../../components/Functions";
import RatingStars from "../../../components/rating/RatingStars";
import {useFocusEffect} from "@react-navigation/native";
import {MaterialIcons, FontAwesome} from '@expo/vector-icons';
import {File, Paths} from 'expo-file-system/next';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const {width} = Dimensions.get('window');

export default function SetDetailScreen({route, navigation, setGlobalError, setGlobalLoading}) {
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

    const togglePartsFilter = (key) => {
        setPartsFilter(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    // Parts sort state
    const [partsSort, setPartsSort] = useState({field: 'partNumber', direction: 'asc'});
    const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
    const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);

    const FILTER_OPTIONS = [
        {key: 'missingQuantity', label: 'Missing'},
        {key: 'damagedQuantity', label: 'Broken'},
        {key: 'discolouredQuantity', label: 'Discoloured'},
    ];

    const filterLabel = 'Filter';

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

    // Modal state
    const [selectedPart, setSelectedPart] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [savingPart, setSavingPart] = useState(false);

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
            const rowsHtml = await Promise.all(missingParts.map(async (p) => {
                let imgHtml = '';
                if (p.imageUrl) {
                    const imageUrl = p.imageUrl.startsWith('http')
                        ? p.imageUrl
                        : `${Config.API_BASE_URL}${p.imageUrl}`;
                    try {
                        const localUri = `${FileSystem.cacheDirectory}part-${p.partNumber}.jpg`;
                        await FileSystem.downloadAsync(imageUrl, localUri);
                        const base64 = await FileSystem.readAsStringAsync(localUri, {encoding: FileSystem.EncodingType.Base64});
                        imgHtml = `<img src="data:image/jpeg;base64,${base64}" width="60" height="60" />`;
                    } catch (_) {}
                }
                const safe = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return `<tr>
                    <td>${imgHtml}</td>
                    <td>${p.partNumber || ''}</td>
                    <td>${safe(p.name)}</td>
                    <td>${safe(p.colorName)}</td>
                    <td>${p.quantity || 0}</td>
                    <td>${p.missingQuantity || 0}</td>
                    <td>${p.damagedQuantity || 0}</td>
                    <td>${p.discolouredQuantity || 0}</td>
                </tr>`;
            }));

            const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><style>
table{border-collapse:collapse}
th{background:#1f65ff;color:#fff;padding:8px;border:1px solid #ccc;white-space:nowrap}
td{padding:6px;border:1px solid #ccc;vertical-align:middle}
</style></head>
<body><table>
<thead><tr>
<th>Image</th><th>Part Nr.</th><th>Name</th><th>Color</th>
<th>Quantity</th><th>Missing</th><th>Broken</th><th>Discoloured</th>
</tr></thead>
<tbody>${rowsHtml.join('')}</tbody>
</table></body></html>`;

            const file = new File(Paths.cache, `${set.number}-missing-parts.xls`);
            file.write(html);
            await Sharing.shareAsync(file.uri, {mimeType: 'application/vnd.ms-excel', dialogTitle: 'Export missing parts'});
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
    const handlePrevImage = () => setCurrentImageIndex(prev =>
        prev === 0 ? (set?.images.length ?? 1) - 1 : prev - 1
    );

    const handleNextImage = () => setCurrentImageIndex(prev =>
        (prev + 1) % (set?.images.length ?? 1)
    );

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
        <View style={globalStyles.listItem}>
            {item?.imageUrl ? (
                <TouchableOpacity onPress={() => openImagePreview(item.imageUrl, minifigsWithImages)}>
                    <Image source={{uri: item.imageUrl}} style={globalStyles.image}/>
                </TouchableOpacity>
            ) : (
                <Image source={require('../../../assets/images/no-minifig.png')} style={globalStyles.image}/>
            )}
            <View style={globalStyles.flex1}>
                <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Nr. </Text>{item?.id}</Text>
                <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Name: </Text>{item?.name}</Text>
                <Text style={[globalStyles.setText, globalStyles.setDetailQuantityText]}><Text style={globalStyles.bold}>Quantity: </Text>{item?.quantity}</Text>
            </View>
        </View>
    ), [openImagePreview, minifigsWithImages]);

    const renderPartItem = useCallback(({item}) => (
        <View style={globalStyles.listItem}>
            {item?.imageUrl ? (
                <TouchableOpacity onPress={() => openImagePreview(item.imageUrl?.startsWith('http') ? item.imageUrl : Config.API_BASE_URL + item.imageUrl)}>
                    <Image source={{uri: item.imageUrl?.startsWith('http') ? item.imageUrl : Config.API_BASE_URL + item.imageUrl}} style={globalStyles.image}/>
                </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={globalStyles.flex1} onPress={() => {
                setSelectedPart(item);
                setModalVisible(true);
            }}>
                <View style={globalStyles.flex1}>
                    <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Nr. </Text>{item?.partNumber}</Text>
                    <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Title: </Text>{item?.name}</Text>
                    <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Color: </Text>{item?.colorName}</Text>
                    <Text style={[globalStyles.setText, globalStyles.setDetailQuantityText]}><Text style={globalStyles.bold}>Quantity: </Text>{item?.quantity}</Text>
                    {(item?.missingQuantity || 0) > 0 && (
                        <Text style={[globalStyles.setText, globalStyles.textMissing]}><Text style={globalStyles.bold}>Missing: </Text>{item.missingQuantity}</Text>
                    )}
                    {(item?.damagedQuantity || 0) > 0 && (
                        <Text style={[globalStyles.setText, globalStyles.textBroken]}><Text style={globalStyles.bold}>Broken: </Text>{item.damagedQuantity}</Text>
                    )}
                    {(item?.discolouredQuantity || 0) > 0 && (
                        <Text style={[globalStyles.setText, globalStyles.textDiscoloured]}><Text style={globalStyles.bold}>Discoloured: </Text>{item.discolouredQuantity}</Text>
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
        return <View style={globalStyles.setDetailLoadingContainer} />;
    }

    // ======================
    // RENDER
    // ======================
    return (
        <View style={globalStyles.flex1}>

            {/* HEADER */}
            <View style={globalStyles.header}>
                <Text style={globalStyles.headerTitle} numberOfLines={1}>{set.name}</Text>
                <View style={globalStyles.headerIcons}>
                    {slides[currentSlide]?.id === 'parts' && (
                        <TouchableOpacity onPress={handleExport}>
                            <MaterialIcons name="download" size={28} color="black"/>
                        </TouchableOpacity>
                    )}
                    {slides[currentSlide]?.id === 'details' && (
                        <TouchableOpacity onPress={handleAddImages}>
                            <MaterialIcons name="add-photo-alternate" size={28} color="green"/>
                        </TouchableOpacity>
                    )}
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
                {slides.map((slide, index) => {
                    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                    const dotWidth = scrollX.interpolate({inputRange, outputRange: [8, 18, 8], extrapolate: 'clamp'});
                    const opacity = scrollX.interpolate({inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp'});
                    return (
                        <Animated.View
                            key={slide.id}
                            style={[globalStyles.dot, {width: dotWidth, opacity, backgroundColor: 'black'}]}
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
                    <View style={[globalStyles.setDetailSlideContainer, {width}]}>
                        <Text style={[globalStyles.titleSetText, globalStyles.setDetailSlideTitle]}>
                            {slideItem.title}
                        </Text>
                        <Text style={globalStyles.setDetailSlideIntro}>
                            {slideItem.intro}
                        </Text>

                        {/* DETAILS */}
                        {slideItem.id === 'details' && (
                            <>
                                {set.images?.length > 0 && (
                                    <View style={globalStyles.imageContainer}>
                                        <Image
                                            source={{uri: Config.API_BASE_URL + set.images[currentImageIndex].path}}
                                            style={{width: width - 32, height: (width - 32) * (9 / 16)}}
                                            resizeMode="contain"
                                        />
                                        {set.images[currentImageIndex].id !== null && (
                                            <TouchableOpacity
                                                style={globalStyles.imageDeleteIcon}
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
                                                <TouchableOpacity style={[globalStyles.arrow, globalStyles.arrowLeft]} onPress={handlePrevImage} delayPressIn={0}>
                                                    <FontAwesome name="chevron-left" size={32} color="black"/>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[globalStyles.arrow, globalStyles.arrowRight]} onPress={handleNextImage} delayPressIn={0}>
                                                    <FontAwesome name="chevron-right" size={32} color="black"/>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                )}
                                <View style={globalStyles.ratingRow}>
                                    <Text style={globalStyles.setDetailRatingLabel}>Rating</Text>
                                    <RatingStars
                                        rating={set.rating}
                                        readonly
                                        size={20}
                                        showLabel={false}
                                        style={globalStyles.setDetailRatingNoMargin}
                                    />
                                </View>
                                <View style={globalStyles.divider}/>
                                <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Number: </Text>{set.number}</Text>
                                <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Theme: </Text>{set.themeName}</Text>
                                <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Year: </Text>{set.year}</Text>
                                <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Total parts: </Text>{set.numParts}</Text>
                                <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Specific parts: </Text>{set.specificParts}</Text>
                                <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Total quantity: </Text>{set.totalQuantity}</Text>
                                <Text style={globalStyles.setText}><Text style={globalStyles.bold}>Total mini figs parts: </Text>{set.totalMiniFigsParts}</Text>
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
                                        <Text style={globalStyles.bold}>Complete: </Text>
                                    </Text>
                                    <MaterialIcons
                                        name={set.isComplete && !hasDefectiveParts ? 'check-circle' : 'cancel'}
                                        size={20}
                                        color={set.isComplete && !hasDefectiveParts ? 'green' : 'red'}
                                        style={globalStyles.setDetailStatusIcon}
                                    />
                                </View>
                                <View style={globalStyles.inputContainer}>
                                    <Text style={globalStyles.setText}>
                                        <Text style={globalStyles.bold}>Instructions: </Text>
                                    </Text>
                                    <MaterialIcons
                                        name={set.hasInstructions ? 'check-circle' : 'cancel'}
                                        size={20}
                                        color={set.hasInstructions ? 'green' : 'red'}
                                        style={globalStyles.setDetailStatusIcon}
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
                            <>
                                <View style={globalStyles.setDetailToolbar}>
                                    <TouchableOpacity
                                        onPress={() => setFilterDropdownVisible(true)}
                                        style={[globalStyles.setDetailDropdownBtn, {borderColor: partsFilter.length > 0 ? '#007AFF' : '#555'}]}
                                    >
                                        <MaterialIcons name="filter-list" size={16} color={partsFilter.length > 0 ? '#007AFF' : '#555'}/>
                                        <Text style={[globalStyles.setDetailDropdownBtnText, {color: partsFilter.length > 0 ? '#007AFF' : '#555'}]} numberOfLines={1}>{filterLabel}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setSortDropdownVisible(true)}
                                        style={[globalStyles.setDetailDropdownBtn, globalStyles.setDetailDropdownBtnSort]}
                                    >
                                        <MaterialIcons name="sort" size={16} color="#555"/>
                                        <Text style={[globalStyles.setDetailDropdownBtnText, globalStyles.setDetailDropdownBtnSortText]}>{currentSortLabel}</Text>
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
                <TouchableOpacity style={globalStyles.modalOverlay} activeOpacity={1} onPress={() => setFilterDropdownVisible(false)}>
                    <View style={[globalStyles.modalContent, globalStyles.setDetailDropdownModalContent]}>
                        <TouchableOpacity
                            onPress={() => setFilterDropdownVisible(false)}
                            style={globalStyles.setDetailCloseButton}
                            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                            activeOpacity={0.7}
                        >
                            <Text style={globalStyles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                        <Text style={[globalStyles.modalTitle, globalStyles.setDetailDropdownModalTitle]}>Filter</Text>
                        {FILTER_OPTIONS.map(option => {
                            const active = partsFilter.includes(option.key);
                            return (
                                <TouchableOpacity
                                    key={option.key}
                                    onPress={() => togglePartsFilter(option.key)}
                                    style={globalStyles.setDetailFilterOption}
                                >
                                    <MaterialIcons
                                        name={active ? 'check-box' : 'check-box-outline-blank'}
                                        size={22}
                                        color={active ? '#007AFF' : '#555'}
                                    />
                                    <Text style={globalStyles.setDetailSortOptionText}>{option.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Sort dropdown */}
            <Modal visible={sortDropdownVisible} transparent animationType="fade">
                <TouchableOpacity style={globalStyles.modalOverlay} activeOpacity={1} onPress={() => setSortDropdownVisible(false)}>
                    <View style={[globalStyles.modalContent, globalStyles.setDetailDropdownModalContent]}>
                        <TouchableOpacity
                            onPress={() => setSortDropdownVisible(false)}
                            style={globalStyles.setDetailCloseButton}
                            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                            activeOpacity={0.7}
                        >
                            <Text style={globalStyles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                        <Text style={[globalStyles.modalTitle, globalStyles.setDetailDropdownModalTitle]}>Sort by</Text>
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
                                    style={[globalStyles.setDetailSortOption, active && globalStyles.setDetailSortOptionActive]}
                                >
                                    <Text style={active ? globalStyles.setDetailSortOptionTextBold : globalStyles.setDetailSortOptionText}>{option.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Image preview modal */}
            <Modal visible={!!imagePreviewUrl} transparent animationType="fade">
                <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                        <TouchableOpacity
                            onPress={() => setImagePreviewUrl(null)}
                            style={globalStyles.setDetailCloseButton}
                            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                            activeOpacity={0.7}
                        >
                            <Text style={globalStyles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                        {imagePreviewSize
                            ? <Image
                                source={{uri: imagePreviewUrl}}
                                style={[globalStyles.setDetailPreviewImage, {width: imagePreviewSize.width, height: imagePreviewSize.height}]}
                                resizeMode="contain"
                            />
                            : <ActivityIndicator style={globalStyles.setDetailPreviewLoader}/>
                        }
                        <Text style={globalStyles.setDetailPreviewPartNumber}>
                            {previewItemsRef.current[imagePreviewIndex]?.label}
                        </Text>
                        <View style={globalStyles.setDetailPreviewNavRow}>
                            <TouchableOpacity
                                onPress={() => navigateImagePreview(-1)}
                                disabled={imagePreviewIndex <= 0}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                            >
                                <FontAwesome name="chevron-left" size={24} color={imagePreviewIndex <= 0 ? '#ccc' : '#333'}/>
                            </TouchableOpacity>
                            <Text style={globalStyles.setDetailPreviewNavCounter}>
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
                                        <Text style={globalStyles.setDetailCounterLabel}>{label}</Text>

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
