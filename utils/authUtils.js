import { getToken, clearTokens } from "../services/api/authStorage";
import jwtDecode from "jwt-decode";
import { refreshToken } from "../services/api/tokenService";
import { registerForPushNotifications } from "./notificationUtils";

let pushRegistered = false;

/**
 * Checks stored token validity and redirects user accordingly.
 */
export const checkToken = async (
    navigation,
    setGlobalError,
    setGlobalLoading
) => {

    try {

        const token = await getToken();

        if (!token) {
            navigation.navigate("Login");
            return;
        }

        const decoded = jwtDecode(token);

        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
            const newToken = await refreshToken();
            if (newToken) {
                if (!pushRegistered) { pushRegistered = true; registerForPushNotifications(); }
                navigation.replace("MainTabs");
            } else {
                await clearTokens();
                navigation.navigate("Login");
            }
        } else {
            setGlobalError(null);
            if (!pushRegistered) { pushRegistered = true; registerForPushNotifications(); }
            navigation.replace("MainTabs");
        }

    } catch (error) {
        console.error("checkToken error:", error);
        await clearTokens().catch(() => {});
        navigation.navigate("Login");
    } finally {
        setGlobalLoading(false);
    }
};