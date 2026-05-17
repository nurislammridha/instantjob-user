import Toast from 'react-native-toast-message';

export const showToast = (type = 'success', message = '') => {
    Toast.show({
        type,
        text1: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
        text2: message,
        position: 'top',
        visibilityTime: 3000,
    });
};
