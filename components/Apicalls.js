import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';
import {Alert} from "react-native";

// Build an image object from a local URI for FormData uploads
const imageFromUri = (uri) => {
    const name = uri.split('/').pop();
    const ext = /\.(\w+)$/.exec(name)?.[1] ?? 'jpeg';
    return {uri, name, type: `image/${ext}`};
};

// Authenticated fetch — automatically injects the stored Bearer token.
// Callers can override Authorization in options.headers when a different token is needed.
const apiFetch = async (path, options = {}) => {
    const token = await AsyncStorage.getItem('token');
    return fetch(`${Config.API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Accept': 'application/json',
            ...(token ? {'Authorization': `Bearer ${token}`} : {}),
            ...options.headers,
        },
    });
};

export const savePushToken = async (pushToken) => {
    try {
        await apiFetch('/api/push-token', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({pushToken}),
        });
    } catch (_) {
        // Best-effort — don't block the user if this fails
    }
};

/**
 * Handles the submission of login credentials by making a POST request to the login API.
 * On success, stores the token in local storage and navigates to the MainTabs screen.
 *
 * @param {string} email
 * @param {string} password
 * @param {object} navigation
 * @param {function} setGlobalError
 */
export const handleSubmitLogin = async (email, password, navigation, setGlobalError) => {
    try {
        const response = await apiFetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
        });

        const result = await response.json();
        if (response.ok && result.token && result.refresh_token) {
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
 * Handles user registration by sending a POST request to the API.
 * On success, stores the activation token and navigates to ActivateAccount.
 *
 * @param {string} firstname
 * @param {string} lastname
 * @param {string} email
 * @param {string} password
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 * @param {object} navigation
 */
export const handleSubmitRegistration = async (firstname, lastname, email, password, setGlobalError, setGlobalLoading, navigation) => {
    try {
        const response = await apiFetch('/api/public/user/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                firstName: firstname, lastName: lastname, email, plainPassword: password,
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            setGlobalError('Registration unsuccessful: \n' + result.detail);
        } else {
            await AsyncStorage.setItem('activation-token', result.token);
            navigation.navigate('ActivateAccount');
        }
    } catch (error) {
        setGlobalError('Error registering: ' + error.message);
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Handles the submission of an activation code.
 * On success, stores the returned tokens and navigates to MainTabs.
 *
 * @param {string[]} code - Array of digit strings forming the activation code.
 * @param {object} navigation
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 */
export const handleCodeSubmit = async (code, navigation, setGlobalError, setGlobalLoading) => {
    if (!code.some(value => value.trim() !== "")) {
        setGlobalError('Code must be 4 digits');
        return;
    }

    const activationtoken = await AsyncStorage.getItem('activation-token');
    const data = {token: activationtoken, code: parseInt(code.join(''), 10)};

    try {
        const response = await apiFetch('/api/public/user/activate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (result.token) {
            await AsyncStorage.setItem('token', result.token);
            await AsyncStorage.setItem('refresh_token', result.refresh_token);
            navigation.replace('MainTabs');
        } else {
            setGlobalError(result.message);
        }
    } catch (error) {
        setGlobalError('Error checking token and code');
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Submits a new password using the stored reset token for authorization.
 * On success, removes the reset token and navigates to Login.
 *
 * @param {string} password
 * @param {object} navigation
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 */
export const handlePasswordSubmit = async (password, navigation, setGlobalError, setGlobalLoading) => {
    const resetToken = await AsyncStorage.getItem('reset-password-token');
    const extraHeaders = resetToken
        ? {'Authorization': `Bearer ${resetToken}`, 'Content-Type': 'application/merge-patch+json'}
        : {'Content-Type': 'application/merge-patch+json'};
    try {
        const response = await apiFetch('/api/user/patch', {
            method: 'PATCH',
            headers: extraHeaders,
            body: JSON.stringify({plainPassword: password}),
        });

        await response.json();
        if (resetToken) {
            await AsyncStorage.removeItem('reset-password-token');
            navigation.navigate('Login');
        } else {
            navigation.goBack();
        }
    } catch (error) {
        setGlobalError('Error saving: ' + error.message);
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Sends a forgot-password request. On success, stores the reset token
 * and navigates to ResetPassword.
 *
 * @param {string} email
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 * @param {object} navigation
 */
export const handleForgotPasswordSubmit = async (email, setGlobalError, setGlobalLoading, navigation) => {
    try {
        const response = await apiFetch('/api/public/user/forgot-password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email}),
        });

        const result = await response.json();
        if (result.token) {
            await AsyncStorage.setItem('reset-password-token', result.token);
            navigation.navigate('ResetPassword');
        } else {
            setGlobalError(result.message);
        }
    } catch (error) {
        setGlobalError('Error: ' + error.message);
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Submits the forgot-password verification code. On success, updates the stored
 * reset token and navigates to ChangePassword.
 *
 * @param {string[]} code - Array of digit strings forming the code.
 * @param {function} setGlobalError
 * @param {object} navigation
 * @param {function} setGlobalLoading
 */
export const handleForgotPasswordCodeSubmit = async (code, setGlobalError, navigation, setGlobalLoading) => {
    if (!code.some(value => value.trim() !== "")) {
        setGlobalError('Code must be 4 digits');
        setGlobalLoading(false);
        return;
    }

    const token = await AsyncStorage.getItem('reset-password-token');
    const data = {token, code: parseInt(code.join(''), 10)};

    try {
        const response = await apiFetch('/api/public/user/check-token-code', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (result.token) {
            await AsyncStorage.setItem('reset-password-token', result.token);
            navigation.navigate('ChangePassword');
        } else {
            setGlobalError(result.message);
        }
    } catch (error) {
        setGlobalError(error.message);
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Adds or edits a board. Supports optional image upload via multipart form data.
 * On success, triggers a data refresh and closes the modal.
 *
 * @param {string|null} id
 * @param {string} title
 * @param {string} description
 * @param {boolean} public_private
 * @param {string|null} selectedImage
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 * @param {function} setModalVisible
 * @param {function} onDataUpdated
 * @param {string} mode - 'add' or 'edit'
 */
export const handleSubmitAddEditBoard = async (id, title, description, public_private, selectedImage, setGlobalError, setGlobalLoading, setModalVisible, onDataUpdated, mode) => {
    const formData = new FormData();
    if (id && mode === 'edit') formData.append('id', id);
    if (id && mode === 'add') formData.append('parentId', id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('publicPrivate', public_private);
    if (selectedImage) formData.append('file', imageFromUri(selectedImage));

    try {
        const response = await apiFetch('/api/set-list', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
            setGlobalError('Add board unsuccessful: \n' + result.message);
        } else {
            onDataUpdated(true);
            setModalVisible(false);
        }
    } catch (error) {
        setGlobalError('Error adding board: ' + error.message);
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Adds a Lego set to a board. On success, triggers a data refresh and closes the modal.
 *
 * @param {string} bordId
 * @param {string} legoNmbr
 * @param {boolean} [addLegoImages=false]
 * @param {boolean} [addLegoParts=false]
 * @param {boolean} [addLegoMinifigs=false]
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 * @param {function} setModalVisible
 * @param {function} onDataUpdated
 */
export const handleSubmitAddSet = async (
    bordId,
    legoNmbr,
    addLegoImages = false,
    addLegoParts = false,
    addLegoMinifigs = false,
    setGlobalError,
    setGlobalLoading,
    setModalVisible,
    onDataUpdated
) => {
    try {
        const response = await apiFetch('/api/lego/sets/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: bordId, legoNmbr, addLegoImages, addLegoParts, addLegoMinifigs}),
        });

        const result = await response.json();
        if (!response.ok) {
            setGlobalError('Adding set unsuccessful: ' + result.message);
        } else {
            onDataUpdated();
            setModalVisible(false);
        }
    } catch (error) {
        setGlobalError('Error adding set: \n' + error.message);
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Fetches the details of a specific Lego set within a set list.
 *
 * @param {string} setId
 * @param {string} listId
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 * @returns {Promise<object|undefined>}
 */
export const handleSubmitGetSet = async (setId, listId, setGlobalError, setGlobalLoading) => {
    try {
        const response = await apiFetch(`/api/lego/set-lists/${listId}/sets/${setId}`);
        const result = await response.json();
        if (!response.ok) {
            setGlobalError('Fetching set unsuccessful: ' + result.message);
        } else {
            return result;
        }
    } catch (error) {
        setGlobalError('Error fetching set: \n' + error.message);
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Prompts the user to confirm deletion of a set from a set list, then sends a DELETE request.
 * On success, navigates back to the previous screen.
 *
 * @param {string} setId
 * @param {string} bordId
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 * @param {object} navigation
 */
export const handleSubmitDeleteSetFromSetList = async (setId, bordId, setGlobalError, setGlobalLoading, navigation) => {
    Alert.alert('Delete set', 'Are you sure you want to delete this set?', [{text: 'Cancel', style: 'cancel'}, {
        text: 'Delete', style: 'destructive', onPress: async () => {
            try {
                setGlobalLoading(true);
                const response = await apiFetch(`/api/lego/list/${bordId}/set/${setId}`, {
                    method: 'DELETE',
                });

                const result = await response.json();
                if (!response.ok) {
                    setGlobalError(result?.message || 'Deleting set from set list unsuccessful');
                    return;
                }

                navigation.goBack();
            } catch (error) {
                setGlobalError('Error deleting set from set list:\n' + error.message);
            } finally {
                setGlobalLoading(false);
            }
        },
    }], {cancelable: true});
};

/**
 * Submits updated profile details including an optional new profile image.
 * On success, updates the data state and exits editing mode.
 *
 * @param {string} userName
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} bio
 * @param geslacht
 * @param {string|null} selectedImage
 * @param {function} setGlobalError
 * @param {function} setData
 * @param {function} setIsEditing
 * @param {function} setGlobalLoading
 * @param {object} navigation - reserved for future use
 */
export const handleSubmitEditProfile = async (
    userName,
    firstName,
    lastName,
    bio,
    geslacht,
    selectedImage,
    setGlobalError,
    setData,
    setIsEditing,
    setGlobalLoading,
    navigation
) => {

    const formData = new FormData();
    formData.append('userName', userName || '');
    formData.append('firstName', firstName || '');
    formData.append('lastName', lastName || '');
    formData.append('bio', bio || '');
    formData.append('geslacht', geslacht || '');
    if (selectedImage && typeof selectedImage === 'string' && !selectedImage.startsWith('http')) {
        formData.append('file', imageFromUri(selectedImage));
    } else if (!selectedImage) {
        formData.append('deleteImage', '1');
    }

    try {
        const response = await apiFetch('/api/user-data/edit', {
            method: 'POST',
            body: formData,
        });

        let result = {};
        try {
            result = await response.json();
        } catch (_) {}

        if (!response.ok) {
            setGlobalError('Edit profile unsuccessful: ' + (result.message || result.error || result.detail || 'Unknown error'));
        } else {
            setData(result);
            setIsEditing(false);
        }
    } catch (error) {
        setGlobalError('Error editing profile: \n' + error.message);
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Sends a DELETE request to remove the user's profile.
 * On success, clears stored tokens and navigates to Login.
 *
 * @param {function} setGlobalLoading
 * @param {function} setGlobalError
 * @param {object} navigation
 */
export const handleSubmitDeleteProfile = async (setGlobalLoading, setGlobalError, navigation) => {
    try {
        const response = await apiFetch('/api/user-data/delete', {method: 'DELETE'});
        const result = await response.json();
        if (!response.ok) {
            setGlobalError('Delete profile unsuccessful: ' + result.message);
        } else {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refresh_token');
            Alert.alert('Account Deleted', 'Your account has been successfully deleted.', [{
                text: 'OK', onPress: () => navigation.navigate('Login'),
            }], {cancelable: false});
        }
    } catch (error) {
        setGlobalError('Error deleting profile: \n' + error.message);
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Reloads board data from the API and updates the board state.
 *
 * @param {string} id
 * @param {function} setGlobalLoading
 * @param {function} setBord
 * @param {function} setGlobalError
 */
export const reloadData = async (id, setGlobalLoading, setBord, setGlobalError, query = '') => {
    try {
        setGlobalLoading(true);
        const q = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
        const response = await apiFetch(`/api/set-lists/${id}${q}`, {
            headers: {'Content-Type': 'application/json'},
        });

        const result = await response.json();
        if (response.ok) {
            setBord(result);
        } else {
            setGlobalError(result.message || 'Failed to reload bord');
        }
    } catch (err) {
        setGlobalError(err.message || 'Error fetching bord');
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Prompts the user to confirm deletion of a board, then sends a DELETE request.
 * On success, navigates to the Borden screen.
 *
 * @param {string} bordId
 * @param {function} setGlobalLoading
 * @param {object} navigation
 * @param {function} setGlobalError
 */
export const handleSubmitDeleteBord = (bordId, setGlobalLoading, navigation, setGlobalError) => {
    Alert.alert('Delete Bord', 'Are you sure you want to delete this bord?', [{text: 'Cancel', style: 'cancel'}, {
        text: 'Delete', style: 'destructive', onPress: async () => {
            try {
                setGlobalLoading(true);
                const response = await apiFetch(`/api/set-list/delete/${bordId}`, {method: 'DELETE'});
                const result = await response.json();
                if (!response.ok) {
                    setGlobalError(`Delete unsuccessful: ${result?.message || 'Failed to delete bord.'}`);
                    return;
                }

                Alert.alert('Bord Deleted', 'The bord has been successfully deleted.', [{
                    text: 'OK', onPress: () => navigation.navigate('MainTabs', {screen: 'Borden'}),
                }], {cancelable: false});
            } catch (error) {
                setGlobalError('Error deleting bord:\n' + error.message);
            } finally {
                setGlobalLoading(false);
            }
        },
    }], {cancelable: true});
};

/**
 * Refreshes the authentication token using the stored refresh token.
 *
 * @returns {Promise<string|null>} The new access token, or null on failure.
 */
export const refreshToken = async () => {
    try {
        const refresh = await AsyncStorage.getItem("refresh_token");
        if (!refresh) return null;

        const response = await apiFetch('/api/token/refresh', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({refreshToken: refresh}),
        });

        if (!response.ok) return null;

        const data = await response.json();
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("refresh_token", data.refreshToken);
        return data.token;
    } catch (e) {
        console.error("Error refreshing token", e);
        return null;
    }
};

/**
 * Logs the user out, optionally revoking all devices.
 * Clears local tokens and navigates to Login regardless of server response.
 *
 * @param {boolean} [logoutAll=false]
 * @param {object} navigation
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 */
export const logout = async (logoutAll = false, navigation, setGlobalError, setGlobalLoading) => {
    try {
        const refresh = await AsyncStorage.getItem("refresh_token");
        const response = await apiFetch('/api/logout', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({refreshToken: refresh, allDevices: logoutAll}),
        });

        const data = await response.json();
        if (!response.ok) {
            const errorMessage = typeof data === "string" ? data : data.message || JSON.stringify(data);
            setGlobalError(errorMessage);
        }
    } catch (error) {
        setGlobalError('Error logging out: ' + error.message);
    } finally {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("refresh_token");
        setGlobalLoading(false);
        navigation.navigate('Login');
    }
};

/**
 * Submits a rating for a specific Lego set.
 *
 * @param {string|number} setId
 * @param {number} rating
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 * @returns {Promise<number|null>} The updated rating, or null on failure.
 */
export const handleSubmitSetRating = async (setId, rating, setGlobalError, setGlobalLoading) => {
    try {
        setGlobalLoading(true);
        const response = await apiFetch('/api/lego/sets/rate-set', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({setId: String(setId), rating: Number(rating)}),
        });

        const result = await response.json();
        if (!response.ok) {
            setGlobalError('Adding rating unsuccessful: ' + result.message);
            return null;
        }

        return result.rating ?? null;
    } catch (error) {
        setGlobalError('Error adding set: ' + error.message);
        return null;
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Saves the defect state for a selected part (missing, damaged, discolored quantities).
 * Validates totals before submitting and updates the set state on success.
 *
 * @param {object} selectedPart
 * @param {function} setSavingPart
 * @param {function} setSet
 * @param {function} setModalVisible
 * @param {function} setGlobalError
 */
export const savePartState = async (selectedPart, setSavingPart, setSet, setModalVisible, setGlobalError) => {
    if (!selectedPart) return;

    const totalCount =
        (selectedPart.missingQuantity ?? 0) +
        (selectedPart.damagedQuantity ?? 0) +
        (selectedPart.discolouredQuantity ?? 0);

    if (totalCount > (selectedPart.quantity ?? 0)) {
        setGlobalError(`Cannot save: total selected (${totalCount}) exceeds available quantity (${selectedPart.quantity}).`);
        return;
    }

    setSavingPart(true);
    try {
        const response = await apiFetch('/api/lego/set/part/defect/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                missingQuantity: selectedPart.missingQuantity ?? 0,
                damagedQuantity: selectedPart.damagedQuantity ?? 0,
                discolouredQuantity: selectedPart.discolouredQuantity ?? 0,
                colorId: selectedPart.colorId,
                partId: selectedPart.partNumber,
                setNumber: selectedPart.setNumber,
                bordId: selectedPart.bordId,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Unknown API error");
        }

        const data = await response.json();
        setSet(prev => ({
            ...prev,
            setParts: prev.setParts.map(p =>
                p.setPartId === selectedPart.setPartId
                    ? {
                        ...p,
                        missingQuantity: selectedPart.missingQuantity ?? 0,
                        damagedQuantity: selectedPart.damagedQuantity ?? 0,
                        discolouredQuantity: selectedPart.discolouredQuantity ?? 0,
                    }
                    : p
            ),
        }));

        setModalVisible(false);
    } catch (err) {
        console.error(err);
        setGlobalError("Failed to save part state.");
    } finally {
        setSavingPart(false);
    }
};

export const deleteSetImage = async (mediaId, setGlobalError) => {
    try {
        const response = await apiFetch(`/api/set-images/delete/${mediaId}`, {
            method: 'DELETE',
        });

        if (!response.ok && response.status !== 204) {
            const data = await response.json();
            setGlobalError(data.error || 'Failed to delete image');
            return false;
        }

        return true;
    } catch (error) {
        setGlobalError(error.message || 'Failed to delete image');
        return false;
    }
};

/**
 * Uploads one or more images to a specific Lego set within a set list.
 *
 * @param {object[]} images - Array of image assets with uri and optional type fields.
 * @param {string} setNumber
 * @param {string} listId
 * @param {function} setGlobalError
 * @returns {Promise<object[]|null>}
 */
export const uploadImagesToSet = async (images, setNumber, listId, setGlobalError) => {
    if (!images || images.length === 0) return [];

    const formData = new FormData();
    images.forEach((asset, i) => {
        formData.append("files[]", {
            uri: asset.uri,
            type: asset.type || "image/jpeg",
            name: `image_${Date.now()}_${i}.jpg`,
        });
    });

    try {
        const response = await apiFetch(`/api/lego/set-lists/${listId}/sets/${setNumber}/add-images`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (data.error) {
            setGlobalError("Upload Error: " + data.error);
            return null;
        }

        return data;
    } catch (error) {
        setGlobalError("Upload Error: " + error.message);
        return null;
    }
};

/**
 * Fetches the current user's profile data from the API.
 *
 * @param {function} setData
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 */
export const fetchData = async (setData, setGlobalError, setGlobalLoading) => {
    try {
        const response = await apiFetch('/api/user-data/', {
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            setGlobalError(`HTTP error! Status: ${response.status}`);
            return;
        }

        setData(await response.json());
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong!');
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Fetches the list of set lists from the API.
 *
 * @param {function} setData
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 */
export const fetchSetListById = async (id, setGlobalError) => {
    try {
        const response = await apiFetch(`/api/set-list/${id}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong!');
        return null;
    }
};

export const fetchModelLists = async (setData, setGlobalError, setGlobalLoading) => {
    try {
        const response = await apiFetch('/api/set-lists-for-user', {
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        setData(await response.json());
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong!');
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Fetches a public user profile by user ID.
 *
 * @param {string|number} userId
 * @param {function} setData
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 */
export const fetchPublicUserData = async (userId, setData, setGlobalError, setGlobalLoading) => {
    try {
        const response = await apiFetch(`/api/public/user/${userId}`, {
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            setGlobalError(`HTTP error! Status: ${response.status}`);
            return;
        }

        setData(await response.json());
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong!');
    } finally {
        setGlobalLoading(false);
    }
};

/**
 * Fetches the 10 latest public boards for a given user.
 *
 * @param {string|number} userId
 * @param {function} setData
 * @param {function} setGlobalError
 * @param {function} setGlobalLoading
 */
export const fetchPublicUserBords = async (userId, setData, setGlobalError, setGlobalLoading, page = 1, limit = 10) => {
    try {
        const response = await apiFetch(`/api/public/user/${userId}/bords?page=${page}&limit=${limit}`, {
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            setGlobalError(`HTTP error! Status: ${response.status}`);
            return;
        }

        setData(await response.json());
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong!');
    } finally {
        setGlobalLoading(false);
    }
};

export const updateNotificationPreferences = async (prefs, setGlobalError) => {
    try {
        const response = await apiFetch('/api/notification-preferences', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(prefs),
        });
        const result = await response.json();
        if (!response.ok) {
            setGlobalError(result.message || 'Could not save preferences');
            return null;
        }
        return result.notificationPreferences;
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong');
        return null;
    }
};

export const fetchFriends = async (setData, setGlobalError, setGlobalLoading) => {
    try {
        const response = await apiFetch('/api/friends');
        if (!response.ok) {
            setGlobalError('Could not load friends');
            return;
        }
        setData(await response.json());
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong');
    } finally {
        setGlobalLoading(false);
    }
};

export const fetchFriendshipStatus = async (userId, setStatus, setGlobalError) => {
    try {
        const response = await apiFetch(`/api/friends/status/${userId}`);
        if (!response.ok) return;
        setStatus(await response.json());
    } catch (_) {}
};

export const sendFriendRequest = async (userId, setGlobalError) => {
    try {
        const response = await apiFetch(`/api/friends/request/${userId}`, {method: 'POST'});
        const result = await response.json();
        if (!response.ok) {
            setGlobalError(result.message || 'Could not send friend request');
            return null;
        }
        return result;
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong');
        return null;
    }
};

export const acceptFriendRequest = async (requestId, setGlobalError) => {
    try {
        const response = await apiFetch(`/api/friends/accept/${requestId}`, {method: 'POST'});
        if (!response.ok) {
            const result = await response.json();
            setGlobalError(result.message || 'Could not accept request');
            return false;
        }
        return true;
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong');
        return false;
    }
};

export const removeFriend = async (friendshipId, setGlobalError) => {
    try {
        const response = await apiFetch(`/api/friends/${friendshipId}`, {method: 'DELETE'});
        if (!response.ok) {
            const result = await response.json();
            setGlobalError(result.message || 'Could not remove friend');
            return false;
        }
        return true;
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong');
        return false;
    }
};

export const fetchPublicSetLists = async (setData, setGlobalError, setGlobalLoading, page = 1, limit = 10, query = '') => {
    try {
        const trimmedQuery = query.trim();
        const endpoint = trimmedQuery
            ? `/api/set-lists-public-search?page=${page}&limit=${limit}&q=${encodeURIComponent(trimmedQuery)}`
            : `/api/set-lists-public?page=${page}&limit=${limit}`;
        const response = await apiFetch(endpoint, {
            headers: {'Content-Type': 'application/json'},
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        setData(await response.json());
    } catch (error) {
        setGlobalError(error.message || 'Something went wrong!');
    } finally {
        setGlobalLoading(false);
    }
};
