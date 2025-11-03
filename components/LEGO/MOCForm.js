import React from 'react';
import { View, TextInput } from 'react-native';

const MOCForm = ({ title, description, onChange }) => {
    return (
        <View>
            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={(text) => onChange('title', text)}
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 8,
                    borderRadius: 8,
                    marginBottom: 10,
                }}
            />
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={(text) => onChange('description', text)}
                multiline
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 8,
                    borderRadius: 8,
                    height: 100,
                    marginBottom: 10,
                }}
            />
        </View>
    );
};

export default MOCForm;
