import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Button } from 'react-native';
import MOCForm from '../components/MOCForm';
import OriginalLegoForm from '../components/OriginalLegoForm';

const AddItemScreen = () => {
    const [choice, setChoice] = useState(null);
    const [mocData, setMocData] = useState({ title: '', description: '' });
    const [legoData, setLegoData] = useState(null);

    const handleMocChange = (field, value) => {
        setMocData({ ...mocData, [field]: value });
    };

    const handleSubmit = () => {
        if (choice === 'MOC') {
            console.log('Submitting MOC:', mocData);
        } else {
            console.log('Submitting LEGO Model:', legoData);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            {!choice ? (
                <>
                    <Text style={{ fontSize: 18, marginBottom: 10 }}>What do you want to add?</Text>
                    <TouchableOpacity
                        onPress={() => setChoice('MOC')}
                        style={{
                            backgroundColor: '#4caf50',
                            padding: 10,
                            borderRadius: 10,
                            marginVertical: 5,
                        }}
                    >
                        <Text style={{ color: '#fff', textAlign: 'center' }}>Add MOC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setChoice('ORIGINAL')}
                        style={{
                            backgroundColor: '#2196f3',
                            padding: 10,
                            borderRadius: 10,
                            marginVertical: 5,
                        }}
                    >
                        <Text style={{ color: '#fff', textAlign: 'center' }}>Add Original LEGO Model</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    {choice === 'MOC' ? (
                        <MOCForm
                            title={mocData.title}
                            description={mocData.description}
                            onChange={handleMocChange}
                        />
                    ) : (
                        <OriginalLegoForm onFetched={setLegoData} />
                    )}

                    <View style={{ marginTop: 20 }}>
                        <Button title="Submit" onPress={handleSubmit} />
                        <Button title="Back" color="gray" onPress={() => setChoice(null)} />
                    </View>
                </>
            )}
        </View>
    );
};

export default AddItemScreen;
