import React, { useEffect } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { useStyles } from '../../styles';
import { checkToken } from '../../utils/authUtils';
import ErrorBanner from '../../components/ui/ErrorBanner';

export default function SplashScreen({ navigation, setGlobalError, setGlobalLoading }) {
    const styles = useStyles();

    useEffect(() => {
        setGlobalLoading(true);

        checkToken(navigation, setGlobalError, setGlobalLoading);
    }, []);

    return (
        <View style={styles.setDetailLoadingContainer}>
            <ErrorBanner />
            <Image
                style={styles.stretch}
                source={require('../../assets/images/lego_logo.png')}
            />
            <ActivityIndicator size="large" style={{ marginTop: 32 }} />
        </View>
    );
}