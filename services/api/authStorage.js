import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveTokens = async (token, refresh) => {
    const pairs = [['token', token]];
    if (refresh) pairs.push(['refresh_token', refresh]);
    await AsyncStorage.multiSet(pairs);
};

export const getToken = async () => {
    return AsyncStorage.getItem('token');
};

export const getRefreshToken = async () => {
    return AsyncStorage.getItem('refresh_token');
};

export const clearTokens = async () => {
    await AsyncStorage.multiRemove(['token', 'refresh_token']);
};