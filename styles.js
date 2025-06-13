import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
        marginTop: 15,
        marginHorizontal: 20,
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
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
        MarginLeft: 3,
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
        color: '#333',
        marginBottom: 8,
    },
    emailText: {
        fontSize: 18,
        color: '#666',
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    imageContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#e1e1e1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholder: {
        color: '#777',
    },
    editButton: {
        position: 'absolute', // Position above the image
        top: 10, // Adjust top position as needed
        right: 10, // Adjust right position as needed
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
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
        menuItem: {
            borderTopColor: '##808080',
            borderRadius: 5,
            borderTopWidth: 1,
            padding: 10,
        },
        menuText: {
            fontSize: 18,
            color: '#fff',
            fontWeight: 'bold',
        },

        icon: {
            paddingRight: 40,
        }
    },
    listContainer: {
        padding: 16,
        flex: 1,
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
        backgroundColor: '#007BFF', // Mooi blauw
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
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
        bottom: 10,
        backgroundColor: '#007AFF',
        width: 60,
        height: 60,
        borderRadius: 20,
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
        fontSize: 40,
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
    counter: {
        position: 'absolute',
        right: 10,
        top: 10,
        fontSize: 14,
        color: 'gray',
        backgroundColor: 'transparent',
    },
});
