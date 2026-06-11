import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getData } from '../assets/functions/helperFunction';

const splash = require('../assets/images/splash.png');

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const isLogin = await getData('isLogin');
                if (isLogin) {
                    navigation.replace('Home');
                } else {
                    navigation.replace('Login');
                }
            } catch {
                navigation.replace('Login');
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Image source={splash} style={styles.image} resizeMode="cover" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A5CC1',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default SplashScreen;
