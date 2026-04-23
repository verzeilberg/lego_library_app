import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from "jwt-decode";
import { refreshToken } from "../components/Apicalls";
import { registerForPushNotifications } from "./notificationUtils";

/**
 * Checks stored token validity and redirects user accordingly.
 */
export const checkToken = async (
    navigation,
    setGlobalError,
    setGlobalLoading
) => {

    try {

        const token = await AsyncStorage.getItem("token");

        if (!token) {
            navigation.navigate("Login");
            return;
        }

        const decoded = jwtDecode(token);

        const now = Date.now().valueOf() / 1000;
        if (decoded.exp && decoded.exp < now) {
            const newToken = await refreshToken(token);
            if (newToken) {
                await AsyncStorage.setItem("token", newToken);
                registerForPushNotifications();
                navigation.replace("MainTabs");
            } else {
                await AsyncStorage.removeItem("token");
                navigation.navigate("Login");
            }
        } else {
            setGlobalError(null);
            registerForPushNotifications();
            navigation.replace("MainTabs");
        }

    } catch (error) {
        navigation.navigate("Login");
    } finally {
        setGlobalLoading(false);
    }
};