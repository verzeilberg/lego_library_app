import React, { useEffect } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { globalStyles } from '../../styles';
import { checkToken } from '../../utils/authUtils';

export default function SplashScreen({ navigation, setGlobalError, setGlobalLoading }) {

    useEffect(() => {
        setGlobalLoading(true);

        checkToken(navigation, setGlobalError, setGlobalLoading);
    }, []);

    return (
        <View style={globalStyles.setDetailLoadingContainer}>
            <Image
                style={globalStyles.stretch}
                source={require('../../assets/images/lego_logo.png')}
            />
            <ActivityIndicator size="large" style={{ marginTop: 32 }} />
        </View>
    );
}