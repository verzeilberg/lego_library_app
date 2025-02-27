import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config'; // Adjust the path based on your project structure

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
        if (response.ok && result.token) {
            await AsyncStorage.setItem('token', result.token);
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

    } catch (err) {
        setErrorMessage(err.message);
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
                console.error('Error saving:', error);
            });

    } catch (err) {
        console.log(err.message);
    }
};

export const handleForgotPasswordSubmit = (email, setErrorMessage, navigation) => {
    // Assuming platformAPI is your API endpoint (ip is ip4 from internet connection (wifi or cable), you can not use a server with a port like 8080)
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

