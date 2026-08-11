import React, {useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, Animated} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useStyles} from '../../styles';
import {useError} from '../../contexts/ErrorContext';

export default function ErrorBanner() {
    const styles = useStyles();
    const {globalError: error, setGlobalError: onDismiss} = useError();
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!error) return;
        progress.setValue(0);
        const animation = Animated.timing(progress, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
        });
        animation.start(({finished}) => {
            if (finished) onDismiss(null);
        });
        return () => animation.stop();
    }, [error, progress, onDismiss]);

    if (!error) return null;

    const fillWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.errorBanner}>
            <TouchableOpacity
                onPress={() => onDismiss(null)}
                style={styles.errorBannerClose}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
                <Ionicons name="close" size={18} color="#fff"/>
            </TouchableOpacity>
            <Text style={styles.errorBannerText}>{error}</Text>
            <View style={styles.errorBannerProgressTrack}>
                <Animated.View style={[styles.errorBannerProgressFill, {width: fillWidth}]}/>
            </View>
        </View>
    );
}
