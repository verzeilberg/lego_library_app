import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Animated } from 'react-native';
import { useStyles, useTheme } from '../../styles';

export default function FloatingLabelInput({ placeholder, value, onChangeText, multiline = false }) {
    const styles = useStyles();
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animated, {
            toValue: (isFocused || value) ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    const labelStyle = {
        position: 'absolute',
        left: 10,
        top: -2,
        paddingHorizontal: 5,
        zIndex: 99,
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: colors.background,
    };

    return (
        <View style={{ width: '100%', marginTop: 10 }}>
            <Animated.Text style={labelStyle}>{placeholder}</Animated.Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                style={[
                    styles.floatLabelInput,
                    multiline && { height: 120, textAlignVertical: 'top', paddingTop: 10 } // adjust for multiline
                ]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                multiline={multiline}
            />
        </View>
    );
}
