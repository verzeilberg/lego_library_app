import React from 'react';
import {View, Modal} from 'react-native';
import LottieView from 'lottie-react-native';
import spinner from '../components/spinners/spinner.json';

/**
 * LoadingSpinner Component
 * Displays a centered loading spinner.
 *
 */
const LoadingSpinner = ({ visible = false }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <LottieView
                    source={spinner}
                    autoPlay
                    loop
                    style={{
                        width: 200,
                        height: 200,
                    }}
                />
            </View>
        </Modal>
    );
};

export default LoadingSpinner;
