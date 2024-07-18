import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome";

import handleSubmit from './Functions';

export default function Button({ label, username, password }) {
    return (
        <View style={[styles.buttonContainer, styles.shadowProp, styles.elevation]}>
            <Pressable
                style={styles.button}
                onPress={handleSubmit(username, password)}
            >
                <FontAwesome
                    name="user"
                    size={8}
                    color="gray"
                    style={styles.buttonIcon}
                />
                <Text style={styles.buttonLabel}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: '90%',
        height: 40,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: '#3f5896',
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonIcon: {
        paddingRight: 8,
        fontSize: 18,
        color: '#ffffff',
    },
    buttonLabel: {
        color: '#ffffff',
    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },

    elevation: {
        elevation: 12,
        shadowColor: '#171717',
    },
});
