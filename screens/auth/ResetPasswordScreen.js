import React, {useState, useRef} from 'react';
import {View, TextInput, Text, Pressable} from 'react-native';
import {useStyles} from "../../styles";
import {handleChange, handleKeyPress} from "../../utils/formUtils";
import {handleForgotPasswordCodeSubmit} from "../../components/Apicalls";
import ErrorBanner from "../../components/ui/ErrorBanner";

export default function FourDigitCodeInput({navigation, setGlobalError, setGlobalLoading}) {
    const styles = useStyles();
    const [code, setCode] = useState(['', '', '', '']);
    const inputRefs = useRef([]);

    return (
        <View style={styles.flex1}>
            <ErrorBanner />
            <View style={styles.container}>
            <Text style={styles.paragraph}>Vul hieronder het 4-cijferige code in die u heeft ontvangen via de mail.</Text>
            <View style={styles.row}>
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(input) => (inputRefs.current[index] = input)}
                        style={styles.inputNumber}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index, code,  setCode, inputRefs)}
                        onKeyPress={(e) => handleKeyPress(e, index, code, inputRefs)}
                        keyboardType="numeric"
                        maxLength={1}
                    />
                ))}
            </View>
            <Pressable
                style={styles.button}
                onPress={() => {
                    setGlobalLoading(true);
                    handleForgotPasswordCodeSubmit(code, setGlobalError, navigation, setGlobalLoading)
                }}
            >
                <Text style={[styles.text, {color: '#fff'}]}>Reset</Text>
            </Pressable>
            </View>
        </View>
    );
};
