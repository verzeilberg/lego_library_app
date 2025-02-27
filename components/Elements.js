import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import spinner from '../components/spinners/spinner.json';

/**
 * LoadingSpinner Component
 * Displays a centered loading spinner.
 *
 * @param {string} size - The size of the spinner ('small' | 'large'). Default is 'large'.
 * @param {string} color - The color of the spinner. Default is '#0000ff'.
 */
const LoadingSpinner = () => {
    return (
        <LottieView
            source={spinner}
            autoPlay
            loop
            style={{ width: 400, height: 400, margin:0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}
        />
    );
};

export default LoadingSpinner;
