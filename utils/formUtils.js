/**
 * Utilities related to form inputs and OTP fields
 */

/**
 * Handles backspace navigation for multi-input OTP fields.
 */
export const handleKeyPress = (e, index, code, inputRefs) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
    }
};


/**
 * Handles input change for OTP code inputs.
 */
export const handleChange = (text, index, code, setCode, inputRefs) => {

    const newCode = [...code];
    newCode[index] = text;

    if (text.length === 1 && index < 3) {
        inputRefs.current[index + 1].focus();
    }

    setCode(newCode);
};