import React, {useState, useRef} from 'react';
import {View, TextInput, Text, Pressable} from 'react-native';
import {globalStyles} from "../styles";
import {handleCodeSubmit} from "../components/Apicalls";
import {handleChange} from "../components/Functions";
import {handleKeyPress} from "../components/Functions";

export default function FourDigitCodeInput({navigation, setGlobalError, setGlobalLoading}) {
    const [code, setCode] = useState(['', '', '', '']);
    const inputRefs = useRef([]);

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.paragraph}>Beste gebruiker, Vul hieronder het 4-cijferige code in die u heeft ontvangen via de mail.</Text>
            <View style={globalStyles.row}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(input) => (inputRefs.current[index] = input)}
                        style={globalStyles.inputNumber}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index, code, setCode, inputRefs)}
                        onKeyPress={(e) => handleKeyPress(e, index, code, inputRefs)}
                        keyboardType="numeric"
                        maxLength={1}
                    />
                ))}
            </View>
            <Pressable
                style={globalStyles.button}
                onPress={() => {
                    setGlobalLoading(true);
                    handleCodeSubmit(code, navigation, setGlobalError, setGlobalLoading);
                }}
            >
                <Text style={globalStyles.text}>Activate</Text>
            </Pressable>
        </View>
    );
};
