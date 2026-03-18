/**
 * Toggles password visibility.
 */
export const togglePasswordVisibility = (isSecure, setIsSecure) => {
    setIsSecure(!isSecure);
};


/**
 * Generates a random strong password.
 */
export const generatePassword = (length = 12) => {

    const chars =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?';

    let newPassword = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        newPassword += chars[randomIndex];
    }

    return newPassword;
};


/**
 * Generates a suggested password and updates state.
 */
export const handleGeneratePassword = (setPassword) => {
    const generatedPassword = generatePassword(16);
    setPassword(generatedPassword);
};


/**
 * Validates password and confirm password fields.
 */
export const checkPassword = (password, confirmPassword, setGlobalError) => {

    if (password === confirmPassword && password.length > 0) {
        return true;
    }

    setGlobalError('Passwords do not match!');
    return false;
};