import AsyncStorage from '@react-native-community/async-storage';
import { isValidPhoneNumber, } from 'libphonenumber-js';
import { parsePhoneNumber } from 'libphonenumber-js/min';
export const storeData = async (name, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(name, jsonValue);
    } catch (e) {

    }
}
export const getData = async (name) => {
    try {
        const jsonValue = await AsyncStorage.getItem(name) || [];
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        // error reading value
    }
};


export const validatePhoneNumber = (phoneNumber, countryCode = 'US') => {
    try {
        // Check if the phone number is valid
        if (!isValidPhoneNumber(phoneNumber, countryCode)) {
            return { isValid: false, error: 'Invalid phone number format' };
        }

        // Parse the phone number for detailed validation
        const parsedNumber = parsePhoneNumber(phoneNumber, countryCode);

        // Ensure it's a valid international number
        if (!parsedNumber.isValid() || !parsedNumber.isPossible()) {
            return { isValid: false, error: 'Invalid or impossible phone number' };
        }

        return { isValid: true, parsedNumber }; // Return parsed details if valid
    } catch (error) {
        return { isValid: false, error: 'Error validating phone number' };
    }
};
export const validateEmail = (email) => {
    try {
        // Basic email regex pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'Email must be a string' };
        }

        if (!emailRegex.test(email)) {
            return { isValid: false, error: 'Invalid email format' };
        }

        return { isValid: true, normalizedEmail: email.trim().toLowerCase() };
    } catch (error) {
        return { isValid: false, error: 'Error validating email' };
    }
};
