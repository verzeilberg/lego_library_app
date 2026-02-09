import { Animated, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useRef } from 'react';

export function RectangleSwitchMini({
                                 value,
                                 onChange,
                                 width = 50,
                                 height = 24,
                                 activeColor = '#3dd51e',
                                 inactiveColor = '#ccc',
                                 knobColor = '#fff',
                             }) {
    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: value ? 1 : 0,
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const knobSize = height - 4;
    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, width - knobSize - 4],
    });

    const backgroundColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveColor, activeColor],
    });

    return (
        <TouchableWithoutFeedback onPress={() => onChange(!value)}>
            <Animated.View
                style={{
                    width,
                    height,
                    backgroundColor,
                    borderRadius: 4,
                    padding: 2,
                    justifyContent: 'center',
                }}
            >
                <Animated.View
                    style={{
                        width: knobSize,
                        height: knobSize,
                        backgroundColor: knobColor,
                        borderRadius: 2,
                        transform: [{ translateX }],
                    }}
                />
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}
