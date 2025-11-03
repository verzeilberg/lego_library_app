import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

const LegoModelForm = ({ onFetched }) => {
    const [legoModelNumber, setLegoModelNumber] = useState('');
    const [legoData, setLegoData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLegoModel = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(
                `https://rebrickable.com/api/v3/lego/sets/${legoModelNumber}/?key=YOUR_API_KEY`
            );
            if (!res.ok) throw new Error('Model not found');
            const data = await res.json();
            setLegoData(data);
            onFetched(data);
        } catch (err) {
            setError(err.message);
            setLegoData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <TextInput
                placeholder="LEGO Set Number (e.g. 21318)"
                value={legoModelNumber}
                onChangeText={setLegoModelNumber}
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 8,
                    borderRadius: 8,
                    marginBottom: 10,
                }}
            />
            <Button title="Fetch Model Info" onPress={fetchLegoModel} />

            {loading && <Text style={{ marginTop: 10 }}>Loading...</Text>}
            {error && <Text style={{ marginTop: 10, color: 'red' }}>{error}</Text>}

            {legoData && (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: 'bold' }}>{legoData.name}</Text>
                    <Text>Pieces: {legoData.num_parts}</Text>
                    <Text>Year: {legoData.year}</Text>
                </View>
            )}
        </View>
    );
};

export default LegoModelForm;
