import AsyncStorage from '@react-native-community/async-storage';

export const storeData = async (name, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(name, jsonValue);
    } catch (e) {}
};

export const getData = async (name) => {
    try {
        const jsonValue = await AsyncStorage.getItem(name);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        return null;
    }
};

export const removeData = async (name) => {
    try {
        await AsyncStorage.removeItem(name);
    } catch (e) {}
};


export const validateEmail = (email) => {
    try {
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
