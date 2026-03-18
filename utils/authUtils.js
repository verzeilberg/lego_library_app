import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from "jwt-decode";
import { refreshToken } from "../components/Apicalls";

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

        //@todo restore code
        //const now = Date.now().valueOf() / 1000;
        const now = (Date.now().valueOf() / 1000) + 999999;

        if (decoded.exp && decoded.exp < now) {

            const newToken = await refreshToken(token);

            if (newToken) {

                await AsyncStorage.setItem("token", newToken);
                navigation.replace("MainTabs");

            } else {

                await AsyncStorage.removeItem("token");
                navigation.navigate("Login");

            }

        } else {

            setGlobalError(null);
            navigation.replace("MainTabs");

        }

    } catch (error) {

        navigation.navigate("Login");

    } finally {

        setGlobalLoading(false);

    }
};