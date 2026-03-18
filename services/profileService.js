import { Alert } from "react-native";
import { handleSubmitDeleteProfile } from "../components/Apicalls";

/**
 * Displays delete profile confirmation dialog.
 */
export const confirmDelete = (
    setGlobalLoading,
    setGlobalError,
    navigation
) => {

    Alert.alert(
        "Delete Profile",
        "Are you sure you want to delete your profile?",
        [
            { text: "No", style: "cancel" },
            {
                text: "Yes",
                onPress: () =>
                    handleSubmitDeleteProfile(
                        setGlobalLoading,
                        setGlobalError,
                        navigation
                    )
            }
        ],
        { cancelable: true }
    );
};