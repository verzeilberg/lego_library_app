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
export const handleSubmitLogin = async (email, password, navigation, setErrorMessage) => {
    const apiUrl = `${Config.API_BASE_URL}/api/login`;
    setErrorMessage(null);
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

            navigation.navigate('Profile');
        } else {
            setErrorMessage('Login unsuccessful: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        setErrorMessage('Error logging in: ' + error.message);
    }
};

/**
 * Handles user registration by sending a POST request to the API with the provided registration details.
 *
 * @param {string} firstname - The first name of the user.
 * @param {string} lastname - The last name of the user.
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @param {function} setErrorMessage - Function to set and display an error message if registration fails.
 * @param {object} navigation - Navigation object used to navigate between screens in the application.
 *
 * Initiate a POST request to the registration API with user details included in the request body.
 * If the registration is successful, stores the activation token in AsyncStorage and navigates to the 'ActivateAccount' screen.
 * If unsuccessful, set an error message using the `setErrorMessage` function.
 * Logs errors in the console in case of issues during the fetch or JSON parsing process.
 */
export const handleSubmitRegistration = (firstname, lastname, email, password, setErrorMessage, navigation) => {
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
                    setErrorMessage('Registration unsuccesfull: \n' + result.detail);
                } else {
                    const token = result.token;
                    AsyncStorage.setItem('activation-token', token);
                    console.log('asdadasd');
                    navigation.navigate('ActivateAccount');
                }
            })
            .catch(error => {
                console.error('Error registering:', error);
            });

    } catch (err) {
        console.error(err.message);
    }
};

export const handleCodeSubmit = async (code, navigation, setErrorMessage) => {
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
                    AsyncStorage.setItem('token', result.token)
                    navigation.navigate('Profile');
                } else {
                    setErrorMessage(result.message);
                }
            })
            .catch(error => {
                setErrorMessage('Error checking token and code');
            });

    } catch (error) {
        setErrorMessage(error.message);
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
 * @returns {Promise<void>} Resolves when the password update process completes.
 * @throws Logs errors if API call fails or navigation issues occur.
 */
export const handlePasswordSubmit = async (password, navigation) => {
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
                navigation.navigate('Login');
            })
            .catch(error => {
                Alert.alert('Error saving:', error);
            });

    } catch (err) {
        Alert.alert(err.message);
    }
};

export const handleForgotPasswordSubmit = (email, setErrorMessage, navigation) => {
    const apiUrl = Config.API_BASE_URL+'/api/public/user/forgot-password';
    setErrorMessage(null);
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
                AsyncStorage.setItem('reset-password-token', token);
                navigation.navigate('ResetPassword');
            } else {
                setErrorMessage(result.detail);
            }
        })
        .catch(error => {
            setErrorMessage('Error login: ' + error.message);
        });
};

export const handleForgotPasswordCodeSubmit = async (code, setErrorMessage, navigation) => {
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
                    setErrorMessage(result.message);
                }
            })
            .catch(error => {
                setErrorMessage('Error checking token and code');
            });

    } catch (err) {
        setErrorMessage(err.message);
    }
};
export const handleSubmitAddBoard = async (
    title,
    description,
    public_private,
    selectedImage,
    setErrorMessage,
    setModalVisible,
    onDataUpdated
) => {
    const apiUrl = Config.API_BASE_URL + '/api/model-list';
    const token = await AsyncStorage.getItem('token');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('publicPrivate', public_private);

    // Only append image if one is selected
    if (selectedImage) {
        // Make sure selectedImage is a URI like "file:///..."
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
                // Do NOT set 'Content-Type' with FormData; fetch handles it
            },
            body: formData,
        });

        const result = await response.json();

        if (result.message) {
            setErrorMessage('Add board unsuccessful: \n' + result.message);
        } else {
            onDataUpdated();
            setModalVisible(false);
        }
    } catch (error) {
        console.error('Error adding board:', error);
        setErrorMessage('Error adding board: ' + error.message);
    }
};

export const handleSubmitEditProfile = async (
    userName,
    firstName,
    lastName,
    bio,
    selectedImage,
    setErrorMessage,
    setData,
    setIsEditing,
    setLoading,
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
        if (result.message) {
            setErrorMessage('Edit profile unsuccessful: ' + result.message);
        } else {
            setData(result); // update state in ProfileScreen
            setIsEditing(false);
            setLoading(false);
        }
    } catch (error) {
        console.error('Error editing profile:', error);
        setErrorMessage('Error editing profile: \n' + error.message);
    }
};

export const handleSubmitDeleteProfile = async (setLoading, navigation, setErrorMessage) => {
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



        if (result.message) {
            console.log(result.message);
            setErrorMessage('Delete profile unsuccessful: ' + result.message);
        } else {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refresh_token');

            // Show alert
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
        setErrorMessage('Error deleting profile: \n' + error.message);
    } finally {
        setLoading(false);
    }
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


export const logout = async (logoutAll = false, navigation) => {
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
        Alert.alert("Logout failed:", data);
    }

    // Clear local storage
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refresh_token");

    navigation.navigate('Login');
};
