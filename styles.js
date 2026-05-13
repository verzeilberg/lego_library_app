import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    containerKeyboard: {
      flex:1
    },
    container: {
        marginTop: 20,
        marginHorizontal: 20,
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabNavigator: {
      paddingTop: 150,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2,
        marginTop: 15,
    },
    h1: {
        fontFamily: "Bangers_400Regular",
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    input3: {
        marginBottom: 16,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    inputNumber: {
        width: '15%',
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
        marginRight: 3,
        marginLeft: 3,
        marginBottom: 10,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(149, 165, 166, 0.2)',
        textAlign: 'center',
        fontSize: 20,
    },
    inputPassword: {
        paddingRight: 40,
    },
    button: {
        backgroundColor: 'red',
        width: '80%',
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        elevation: 3,
        marginTop: 10,
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        fontFamily: 'Newester-Bold',
    },
    stretch : {
        width: '50%',
        height: '50%',
        resizeMode: "center",
    },
    text: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: 'bold',
        letterSpacing: 0.50,
        color: 'white',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    paragraph: {
        width:'80%',
        marginTop: 20,
    },
    linking: {
        marginBottom: 20,
    },
    link: {
        color: 'black',
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    profileImage: {
        width: 220,
        height: 220,
        borderRadius: 120,
        marginBottom: 20,
        marginTop:20,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 30,
        color: '#333',
        marginBottom: 8,
    },
    emailText: {
        fontSize: 18,
        lineHeight: 24,
        color: '#666',
    },
    titleText: {
        fontSize: 21,
        fontWeight: 'bold',
        lineHeight: 28,
        marginTop: 8,
        marginBottom: 8,
        marginLeft: 8,
    },
    titleSetText: {
        fontSize: 21,
        fontWeight: 'bold',
        lineHeight: 28,
        marginTop: 0,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#555',
        marginBottom: 8,
        marginLeft: 8,
    },
    setText: {
        fontSize: 14,
        color: '#555',
    },
    imageRoundContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#e1e1e1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    parentImageRectangleContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: '#e1e1e1',
        borderRadius: 5,
    },
    imageRectangleContainer: {
        width: "100%",
        backgroundColor: "#e1e1e1",
        aspectRatio: 16 / 9,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    placeholder: {
        color: '#777',
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        borderRadius: 5,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hamburger: {
        marginRight: 15,
        padding: 10,
        zIndex: 10,
    },
    hamburgerText: {
        fontSize: 24,
        color: '#fff',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
    },
    closeText: {
        fontSize: 45,
        color: '#fff',
    },
    sideBar: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -250,
        width: 250,
        backgroundColor: '#5a5a5a',
        padding: 0,
        justifyContent: 'center',
        zIndex: 100,
        elevation: 50,
    },
    listContainer: {
        padding: 16,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    modelListImage: {
        width: '100%',
        aspectRatio: 4 / 3, // past automatisch aan de breedte aan
        resizeMode: 'cover',
    },
    modalPlaceHolder: {
        flex: 1,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    modalContainer: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalCloseButton: {
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        elevation: 5, // for Android shadow
        shadowColor: '#000', // for iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    modalInputFields: {
            width: '100%',
            alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18
    },
    openModalButton: {
        position: 'absolute',
        right: 10,
        bottom: 50,
        backgroundColor: '#007AFF',
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // for Android shadow
        shadowColor: '#000', // for iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    openModalButtonText: {
        flex: 1,
        color: '#fff',
        fontSize: 30,
        lineHeight: 37
    },
    counterLimit: {
        color: 'red',
        fontWeight: 'bold',
    },
    textArea: {
        width: '100%',
        height: 120,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 10,
    },

    input2: {
        borderColor: 'gray',
        borderWidth: 1,
        paddingRight: 60, // ruimte voor de counter
        paddingLeft: 10,
        fontSize: 16,
        width: '100%',
        height: 40,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    pickerContainer: {
        width: '100%',
        marginTop: 10,
        marginBottom: 10,
    },
    pickerLabel: {
        position: 'absolute',
        top: -10,
        left: 10,
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 5,
        zIndex: 99,
    },
    pickerWrapper: {
        width: '100%',
        height: 45,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        fontSize: 10,
        color: '#000',
    },
    pickerItem: {
        fontSize: 14,
    },
    floatLabelInput: {
        width: '100%',
        height: 45,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 13,
        fontSize: 14,
    },
    counter: {
        position: 'absolute',
        right: 10,
        top: 10,
        fontSize: 14,
        color: 'gray',
        backgroundColor: 'transparent',
    },
    profileImageEditText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 8,
    },
    imagePlaceholder: {
        position: 'absolute',
        marginTop: 10,
        backgroundColor: '#FF4D4D',
        padding: 2,
        borderRadius: 15,
        bottom: 20,
        right: 0,
    },
    // Generic
    flex1: {
        flex: 1,
    },
    bold: {
        fontWeight: 'bold',
    },

    // SetDetailScreen
    setDetailLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    setDetailSlideContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    setDetailSlideTitle: {
        fontSize: 18,
    },
    setDetailSlideIntro: {
        fontSize: 14,
        marginBottom: 10,
    },
    setDetailRatingLabel: {
        fontWeight: 'bold',
        marginRight: 8,
    },
    setDetailQuantityText: {
        marginTop: 4,
    },
    textMissing: {
        color: 'red',
    },
    textBroken: {
        color: 'orange',
    },
    textDiscoloured: {
        color: '#b8860b',
    },
    setDetailStatusIcon: {
        marginLeft: 4,
    },
    setDetailToolbar: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    setDetailDropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: 4,
    },
    setDetailDropdownBtnText: {
        fontSize: 13,
    },
    setDetailDropdownModalContent: {
        paddingVertical: 8,
    },
    setDetailDropdownModalTitle: {
        marginBottom: 8,
    },
    setDetailSortOption: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    setDetailSortOptionActive: {
        backgroundColor: '#eee',
    },
    setDetailSortOptionText: {
        fontSize: 15,
    },
    setDetailSortOptionTextBold: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    setDetailFilterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 10,
    },
    setDetailCounterLabel: {
        width: 120,
    },
    arrowLeft: {
        left: 10,
    },
    arrowRight: {
        right: 10,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    divider: {
        height: 2,
        backgroundColor: 'black',
        width: '100%',
        marginVertical: 8,
    },
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
        overflow: 'hidden',
    },
    mainImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    imageDeleteIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 16,
        padding: 4,
    },
    arrow: {
        position: 'absolute',
        top: '50%',
        transform: [{translateY: -25}],
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
    modalOverlay: {flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center"},
    modalContent: {width: "85%", backgroundColor: "white", borderRadius: 12, padding: 20},
    modalTitle: {fontSize: 18, fontWeight: "bold", marginBottom: 20},
    counterRow: {flexDirection: "row", alignItems: "center", marginVertical: 8},
    counterBtn: {
        backgroundColor: 'red',
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        elevation: 3,
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    counterBtnText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    counterValue: {width: 40, textAlign: "center", fontSize: 16},
    saveButton: {backgroundColor: "black", padding: 10, borderRadius: 8, alignItems: "center", marginVertical: 10},
    setDetailCloseButton: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
    },
    closeButtonText: {
        fontSize: 36,
        fontWeight: "600",
        lineHeight: 36,
    },

    // Set detail image preview
    setDetailPreviewLoader: {marginTop: 16},
    setDetailPreviewPartNumber: {textAlign: 'center', marginTop: 8, fontSize: 18, fontWeight: 'bold', color: '#333'},
    setDetailPreviewNavRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8},
    setDetailPreviewNavCounter: {color: '#555', fontSize: 13},
    setDetailPreviewImage: {marginTop: 16, alignSelf: 'center'},
    setDetailRatingNoMargin: {margin: 0, padding: 0},
    setDetailDropdownBtnSort: {borderColor: '#555'},
    setDetailDropdownBtnSortText: {color: '#555'},

    // HomeScreen
    homeScreenContainer: {
        flex: 1,
    },
    homeListCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    homeListThumb: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
    },
    homeListInfo: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    homeListTitle: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        color: '#222',
        marginBottom: 3,
    },
    homeListDesc: {
        fontSize: 12,
        lineHeight: 16,
        color: '#666',
    },
    homeListAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#e1e1e1',
        marginRight: 10,
    },
    homeToggleBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 16,
    },
    homeToggleRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    homeToggleListButton: {
        marginRight: 10,
    },
    homeSearchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 10,
    },
    homeSearchInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#fff',
        marginRight: 8,
    },
    homeSearchButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    homeActivityIndicator: {
        margin: 16,
    },
    homeCardGrid: {
        flex: 1,
        margin: 8,
    },
    homeCardTitleText: {
        marginLeft: 0,
    },
    homeCardDescText: {
        marginLeft: 0,
    },
    homeScrollTopButton: {
        position: 'absolute',
        right: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },

    // HomeScreen card owner
    homeCardBody: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 8,
        paddingBottom: 10,
        paddingTop: 4,
    },
    homeCardText: {
        flex: 1,
    },
    homeOwnerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        marginTop: 14,
    },
    homeOwnerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e1e1e1',
    },

    //Rating slider
    containerSlider: {
        width: "100%",
    },
    iconRowSlider: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    labelSlider: {
        fontWeight: "bold",
        fontSize: 14,
        color: '#555',
    },
    valueSlider: {
        marginTop: 8,
        fontSize: 12,
        textAlign: "center",
    },

    // Shared screen container with padding (BordScreen, PublicBordScreen)
    screenPadding: {
        flex: 1,
        padding: 16,
    },
    // Bord detail header image
    bordHeaderImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    // Action toolbar row at top of bord screen (add/edit/delete buttons)
    bordActionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    // Group of action icon buttons with spacing
    bordActionGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    // Right-aligned view toggle row (list/grid)
    listViewToggle: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginVertical: 10,
    },
    // Section title for settings/config screens (ProfileConfig, ProfilePicture)
    settingsSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
        color: '#333',
        alignSelf: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 6,
        marginBottom: 12,
        width: '100%',
    },
    // Menu row for settings/config screens
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    // Label in settings/config rows
    settingsLabel: {
        fontSize: 14,
        lineHeight: 20,
        color: '#444',
        fontWeight: '500',
        flex: 1,
    },
    // Red delete label in settings/config rows
    settingsDeleteLabel: {
        color: '#dc3545',
    },
    // Full-screen image preview overlay (ProfileScreen, PublicProfileScreen)
    imagePreviewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Full-screen image preview image
    imagePreviewImage: {
        width: '100%',
        height: '100%',
    },
});
