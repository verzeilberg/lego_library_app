import {StyleSheet} from "react-native";

export const globalStyles = StyleSheet.create({
    container: {
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
    input: {
        width: '80%',
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
    },
    text: {
        fontSize: 16,
        lineHeight: 16,
        fontWeight: 'bold',
        letterSpacing: 0.50,
        color: 'white',
    },
    paragraph: {
        width:'80%',
        justifyContent: 'center',
        marginTop: 20
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
});
