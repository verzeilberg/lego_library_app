import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';
import {Alert} from "react-native";

/**
 * Handles the submission of login credentials by making a POST request to the login API.
 * On success, stores the token in local storage and navigates to the Profile screen.
 * On error, updates the error message state.
 *
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @param {object} navigation - The navigation object used to navigate between screens.
 * @param {function} setErrorMessage - Function to update the error message state.
 * @returns {Promise<void>} A promise that resolves when the login process is completed.
 */
export const handleSubmitLogin = async (email, password, navigation, setGlobalError) => {
    const apiUrl = `${Config.API_BASE_URL}/api/login`;
    const data = { email, password };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok && result.token && result.refresh_token) {
            // Store both tokens
            await AsyncStorage.setItem('token', result.token);
            await AsyncStorage.setItem('refresh_token', result.refresh_token);

            navigation.replace('MainTabs');
        } else {
            setGlobalError('Login unsuccessful: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        setGlobalError('Error logging in: ' + error.message);
    }
};

/**
 * Handles user registration by sending a POST request to the API with the provided registration details.
 *
 * @param {string} firstname - The first name of the user.
 * @param {string} lastname - The last name of the user.
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @param setGlobalError
 * @param setGlobalLoading
 * @param {object} navigation - Navigation object used to navigate between screens in the application.
 *
 * Initiate a POST request to the registration API with user details included in the request body.
 * If the registration is successful, stores the activation token in AsyncStorage and navigates to the 'ActivateAccount' screen.
 * If unsuccessful, set an error message using the `setErrorMessage` function.
 * Logs errors in the console in case of issues during the fetch or JSON parsing process.
 */
export const handleSubmitRegistration = (firstname, lastname, email, password, setGlobalError, setGlobalLoading, navigation) => {
    // API endpoint for registration
    const apiUrl = Config.API_BASE_URL+'/api/public/user/register';

    // Sending json data
    const data = {
        firstName: firstname,
        lastName: lastname,
        email: email,
        plainPassword: password
    };

    try {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                const message = result.detail;
                if (message) {
                    setGlobalError('Registration unsuccesfull: \n' + result.detail);
                    setGlobalLoading(false);
                } else {
                    const token = result.token;
                    AsyncStorage.setItem('activation-token', token);
                    setGlobalLoading(false);
                    navigation.navigate('ActivateAccount');
                }
            })
            .catch(error => {
                setGlobalLoading(false);
                setGlobalError('Error registering: ' + error.text);
            });

    } catch (err) {
        setGlobalLoading(false);
        console.error(err.message);
    }
};

/**
 * Handles the submission of an activation code by making an API request
 * to activate a user account.
 *
 * @async
 * @function handleCodeSubmit
 * @param {Array<string>} code - An array of strings representing the activation code digits.
 * @param {Object} navigation - Navigation object used to redirect the user upon successful activation.
 * @param setGlobalError
 * @param setGlobalLoading
 * @throws {Error} Throws an error if an issue occurs during the API call.
 */
export const handleCodeSubmit = async (code, navigation, setGlobalError, setGlobalLoading) => {
    const isValid = code.some(value => value.trim() !== "");
    if (!isValid) {
        setGlobalError('Code must be 4 digits');
        return;
    }

    // API endpoint for activation of the account
    const apiUrl = Config.API_BASE_URL + '/api/public/user/activate';
    const activationtoken = await AsyncStorage.getItem('activation-token')
    const data = {
        token: activationtoken,
        code: parseInt(code.join(''), 10)
    };

    try {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.token) {
                    // Store both tokens
                    AsyncStorage.setItem('token', result.token);
                    AsyncStorage.setItem('refresh_token', result.refresh_token);
                    setGlobalLoading(false);
                    navigation.replace('MainTabs');
                } else {
                    setGlobalError(result.message);
                    setGlobalLoading(false);
                }
            })
            .catch(error => {
                setGlobalError('Error checking token and code');
                setGlobalLoading(false);
            });

    } catch (error) {
        setGlobalError(error.message);
        setGlobalLoading(false);
    }
};

/**
 * Asynchronous function to handle password submission for user account update.
 * Sends a PATCH request to the API with the new password to update the user data.
 * Navigate the user to the login screen upon successful password update.
 *
 * @async
 * @function
 * @param {string} password - The new password to update the user account.
 * @param {object} navigation - The navigation object for changing application screens.
 * @param setGlobalError
 * @param setGlobalLoading
 * @returns {Promise<void>} Resolves when the password update process completes.
 * @throws Logs errors if API call fails or navigation issues occur.
 */
export const handlePasswordSubmit = async (password, navigation, setGlobalError, setGlobalLoading) => {
    // API endpoint for registration
    const apiUrl = Config.API_BASE_URL+'/api/user/patch';
    const token = await AsyncStorage.getItem('reset-password-token');
    // Sending json data
    const data = {
        plainPassword: password,
    };

    try {
        fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer '+token,
                'Content-Type': 'application/merge-patch+json',
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                AsyncStorage.removeItem('reset-password-token');
                setGlobalLoading(false);
                navigation.navigate('Login');
            })
            .catch(error => {
                setGlobalError('Error saving:', error);
                setGlobalLoading(false);
            });

    } catch (err) {
        setGlobalError(err.message);
        setGlobalLoading(false);
    }
};

/**
 * Handles the submission of a forgot password request.
 *
 * This function sends a POST request to the API with the provided email to trigger the forgot password process.
 * If the API returns a token, it stores the token in AsyncStorage and navigates to the ResetPassword screen.
 * If an error occurs or the token is not provided, an error message is set using the `setErrorMessage` function.
 *
 * @param {string} email - The email address associated with the user's account.
 * @param setGlobalError
 * @param setGlobalLoading
 * @param {object} navigation - Navigation object used to redirect the user to the ResetPassword screen.
 */
export const handleForgotPasswordSubmit = (email, setGlobalError, setGlobalLoading, navigation) => {
    const apiUrl = Config.API_BASE_URL+'/api/public/user/forgot-password';
    // Assuming your API expects JSON data
    const data = {
        email: email
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            const token = result.token;
            if (token) {
                setGlobalLoading(false)
                AsyncStorage.setItem('reset-password-token', token);
                setGlobalLoading(false);
                navigation.navigate('ResetPassword');
            } else {
                setGlobalError(result.message);
                setGlobalLoading(false);
            }
        })
        .catch(error => {
            setGlobalError('Error login: ' + error.message);
            setGlobalLoading(false);
        });
};

/**
 * Handles the submission of the forgot password code.
 *
 * This function verifies the provided code by sending it to the server along with a token retrieved from storage.
 * If successful, it updates the token and navigates to the "ChangePassword" screen. In case of an error,
 * it updates the error message state.
 *
 * @param {string[]} code - An array of strings representing the forgot password code input by the user.
 * @param setGlobalError
 * @param {object} navigation - The navigation object used to redirect the user to screens within the application.
 * @param setGlobalLoading
 * @returns {Promise<void>} A promise that resolves when the code submission process completes.
 */
export const handleForgotPasswordCodeSubmit = async (code, setGlobalError, navigation, setGlobalLoading) => {

    const isValid = code.some(value => value.trim() !== "");
    if (!isValid) {
        setGlobalError('Code must be 4 digits');
        setGlobalLoading(false);
        return;
    }

    // API endpoint for registration
    const apiUrl = Config.API_BASE_URL + '/api/public/user/check-token-code';
    const token = await AsyncStorage.getItem('reset-password-token');
    const data = {
        token: token,
        code: parseInt(code.join(''), 10),
    };

    try {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.token) {
                    AsyncStorage.setItem('reset-password-token', result.token)
                    navigation.navigate('ChangePassword');
                } else {
                    setGlobalError(result.message);
                }
            })
            .catch(error => {
                setGlobalError('Error checking token and code');
            })
    } catch (err) {
        setGlobalError(err.message);
    } finally
    {
        setGlobalLoading(false);
    }
};
/**
 * Asynchronously handles the submission of a new board by sending provided
 * details such as title, description, visibility, and an optional image
 * to the server endpoint. Manages the state and UI updates based on the
 * server's response.
 *
 * @param id
 * @param {string} title - The title of the new board being created.
 * @param {string} description - A description for the new board.
 * @param {string} public_private - The visibility flag, typically "public" or "private".
 * @param {string} [selectedImage] - The URI of the selected image file, if one is included.
 * @param setGlobalError
 * @param setGlobalLoading
 * @param {function} setModalVisible - A callback function to control modal visibility.
 * @param {function} onDataUpdated - A callback function triggered when data is successfully updated.
 * @returns {Promise<void>} Resolves when the submission process completes.
 *
 * @throws {Error} If a network or other operational error occurs during the fetch.
 */
export const handleSubmitAddEditBoard = async (
    id,
    title,
    description,
    public_private,
    selectedImage,
    setGlobalError,
    setGlobalLoading,
    setModalVisible,
    onDataUpdated
) => {
    const apiUrl = Config.API_BASE_URL + '/api/model-list';
    const token = await AsyncStorage.getItem('token');

    const formData = new FormData();
    if (id) formData.append('id', id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('publicPrivate', public_private);

    // Only append an image if one is selected
    if (selectedImage) {
        // Make sure the selectedImage is a URI like "file:///..."
        const filename = selectedImage.split('/').pop(); // get file name
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
            uri: selectedImage,
            type: type,
            name: filename,
        });
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            body: formData,
        });

        const result = await response.json();

        if (response.status !== 200) {
            setGlobalError('Add board unsuccessful: \n' + result.message);
            setGlobalLoading(false)
        } else {
            onDataUpdated(true);
            setModalVisible(false);
            setGlobalLoading(false);
        }
    } catch (error) {
        setGlobalError('Error adding board: ' + error.message);
        setGlobalLoading(false);
    }
};

/**
 * Handles the submission of the Edit Profile form by sending updated user data
 * to the server. This function updates user profile details including username,
 * first name, last name, and bio, and optionally uploads a new profile image.
 *
 * @param {string} userName - The updated username of the user.
 * @param {string} firstName - The updated first name of the user.
 * @param {string} lastName - The updated last name of the user.
 * @param {string} bio - The updated user bio.
 * @param {string | null} selectedImage - The URI of the selected profile image.
 * @param setGlobalError
 * @param {function} setData - Function to update user data state in the application.
 * @param {function} setIsEditing - Function to toggle the editing state to false after submission.
 * @param setGlobalLoading
 * @param {object} navigation - Used to navigate within the application if needed.
 *
 * @throws {Error} Logs an error if the profile update process fails. Sets an error message through `setErrorMessage`.
 */
export const handleSubmitEditProfile = async (
    userName,
    firstName,
    lastName,
    bio,
    selectedImage,
    setGlobalError,
    setData,
    setIsEditing,
    setGlobalLoading,
    navigation
) => {
    try {
        const apiUrl = Config.API_BASE_URL + '/api/user-data/edit';
        const token = await AsyncStorage.getItem('token');

        const formData = new FormData();
        formData.append('userName', userName);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('bio', bio);

        if (selectedImage) {
            const filename = selectedImage.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            formData.append('file', { uri: selectedImage, type, name: filename });
        } else {
            formData.append('file', '');
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json', // ✅ expect JSON back
                // DO NOT set Content-Type, fetch will handle multipart boundaries
            },
            body: formData,
        });

        const result = await response.json(); // returns the parsed JSON
        if (response.status !== 200) {
            setGlobalError('Edit profile unsuccessful: ' + result.message);
            setGlobalLoading(false);
        } else {
            setData(result); // update state in ProfileScreen
            setIsEditing(false);
            setGlobalLoading(false);
        }
    } catch (error) {
        setGlobalLoading(false)
        setGlobalError('Error editing profile: \n' + error.message);
    }
};

/**
 * Handles the deletion of a user's profile by sending a DELETE request to the server.
 *
 * @async
 * @function handleSubmitDeleteProfile
 * @param setGlobalLoading
 * @param setGlobalError
 * @param {Object} navigation - The navigation object for controlling app navigation.
 * @throws Will catch and handle errors that occur during the profile deletion process.
 *
 * This function:
 * - Sets the loading state before processing the request.
 * - Sends a DELETE request to the API endpoint for deleting the user profile.
 * - Utilizes the bearer token for authentication.
 * - Handles various outcomes, including API errors or successful deletion.
 * - After successful deletion, removes stored tokens and navigates the user to the Login screen.
 * - Displays error messages via `setErrorMessage` if the API call or token removal fails.
 */
export const handleSubmitDeleteProfile = async (setGlobalLoading, setGlobalError, navigation) => {
    try {
        setLoading(true);
        const apiUrl = Config.API_BASE_URL + '/api/user-data/delete';
        const token = await AsyncStorage.getItem('token');

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        const result = await response.json();
        if (response.status !== 200) {
            setGlobalError('Delete profile unsuccessful: ' + result.message);
        } else {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refresh_token');

            Alert.alert(
                'Account Deleted',
                'Your account has been successfully deleted.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login'),
                    },
                ],
                { cancelable: false }
            );
        }
    } catch (error) {
        setGlobalError('Error deleting profile: \n' + error.message);
    } finally {
        setGlobalLoading(false);
    }
};

export const reloadData = async (id, setLoading, setBord, setGlobalError) => {
    try {
        setLoading(true);
        const url = `${Config.API_BASE_URL}/api/model-list/get/${id}`;
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        if (response.status === 200) setBord(result);
        else setGlobalError(result.message || 'Failed to reload bord');
    } catch (err) {
        console.error('Error in reloadData:', err);
        setGlobalError(err.message || 'Error fetching bord');
    } finally {
        setLoading(false);
    }
};


/**
 * Handles the submission for deleting a bord.
 *
 * This function displays a confirmation alert for deleting a specific bord.
 * If confirmed, it attempts to delete the bord from the server using the DELETE method.
 * Upon success, navigates the user to the main tabs view. In case of failure,
 * an error message is set to inform the user of the issue.
 *
 * @param {string} bordId - The unique identifier of the bord to be deleted.
 * @param {Function} setLoading - A function to control the loading state during the delete operation.
 * @param {Object} navigation - The navigation object used to navigate between screens.
 * @param {Function} setErrorMessage - A function to set error messages in case of a failed operation.
 */
export const handleSubmitDeleteBord = (bordId, setGlobalLoading, navigation, setGlobalError) => {
    Alert.alert(
        'Delete Bord',
        'Are you sure you want to delete this bord?',
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setGlobalLoading(true);
                        const apiUrl = `${Config.API_BASE_URL}/api/model-list/delete/${bordId}`;
                        const token = await AsyncStorage.getItem('token');

                        const response = await fetch(apiUrl, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json',
                            },
                        });

                        const result = await response.json();
                        if (response.status !== 200) {
                            const msg = result?.message || 'Failed to delete bord.';
                            setGlobalError(`Delete unsuccessful: ${msg}`);
                            return;
                        }

                        Alert.alert(
                            'Bord Deleted',
                            'The bord has been successfully deleted.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.navigate('MainTabs', { screen: 'Borden' }),
                                },
                            ],
                            { cancelable: false }
                        );
                    } catch (error) {
                        setGlobalError('Error deleting bord:\n' + error.message);
                    } finally {
                        setGlobalLoading(false);
                    }
                },
            },
        ],
        { cancelable: true }
    );
};

/**
 * Asynchronously refreshes an authentication token using a refresh token stored in local storage.
 *
 * The function retrieves the refresh token from async storage and sends it to the server to obtain a new access token.
 * If successful, it updates the stored tokens (access token and refresh token) in async storage. If the refresh token
 * is unavailable or if the server response is invalid, the function returns null.
 *
 * @returns {Promise<string|null>} A promise resolving to the new access token if successful, or null if refresh fails.
 *
 * @throws {Error} Logs an error if an issue occurs during refresh operations, such as network errors.
 */
export const refreshToken = async () => {
    try {
        const refresh = await AsyncStorage.getItem("refresh_token");
        if (!refresh) return null;

        const apiUrl = `${Config.API_BASE_URL}/api/token/refresh`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refresh }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        // Save both new access + refresh tokens
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("refresh_token", data.refreshToken);

        return data.token;
    } catch (e) {
        console.error("Error refreshing token", e);
        return null;
    }
};


/**
 * Logs the user out of the application and optionally revokes access for all devices.
 *
 * This function performs the following steps:
 * - Retrieves the stored authentication tokens from AsyncStorage.
 * - Sends a request to the server to revoke the authentication token(s). If `logoutAll`
 *   is set to true, it will revoke access for all devices.
 * - Clears the authentication tokens from local storage.
 * - Navigates the user to the login screen.
 *
 * @param {boolean} [logoutAll=false] - Indicates whether logout should invalidate sessions across all devices.
 * @param {Object} navigation - The navigation object used to redirect the user to the login screen.
 * @throws Will display an alert if the logout request fails.
 */
export const logout = async (logoutAll = false, navigation, setGlobalError, setGlobalLoading) => {
    const refresh = await AsyncStorage.getItem("refresh_token");
    const token = await AsyncStorage.getItem("token");

    const apiUrl = `${Config.API_BASE_URL}/api/logout`

    // Call backend to revoke token(s)
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            refreshToken: refresh,
            allDevices: logoutAll,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        const errorMessage = typeof data === "string" ? data : data.message || JSON.stringify(data);
        setGlobalError(errorMessage);
    }

    // Clear local storage
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refresh_token");
    setGlobalLoading(false);
    navigation.navigate('Login');
};
