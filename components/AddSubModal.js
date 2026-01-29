import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

export default function AddSubModal({ visible, onClose, onSubmit }) {
    const [inputValue, setInputValue] = React.useState('');

    const handleSubmit = () => {
        onSubmit(inputValue);
        setInputValue('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Add Sub Item</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter name"
                        value={inputValue}
                        onChangeText={setInputValue}
                    />
                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: 'gray' }]}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSubmit} style={[styles.button, { backgroundColor: 'blue' }]}>
                            <Text style={styles.buttonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12
    },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 16 },
    buttons: { flexDirection: 'row', justifyContent: 'flex-end' },
    button: { padding: 10, borderRadius: 6, marginLeft: 10 },
    buttonText: { color: 'white' }
});
