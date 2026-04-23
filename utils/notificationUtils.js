import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { savePushToken } from '../components/Apicalls';

// Show notifications even when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const registerForPushNotifications = async () => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '9b233da7-d95f-446e-a1fc-211fe39935bb',
    });

    await savePushToken(tokenData.data);
};
