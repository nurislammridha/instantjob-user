import React, { useRef } from 'react'
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import menu from '../assets/icons/menu.png'
import notification from '../assets/icons/notification.png'
import PrimaText from './PrimaText'
import Menu from './Menu'
const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
    con: {
        // position: 'relative'
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    img: {
        width: 24,
        height: 24
    },
    slide: {
        backgroundColor: '#fff',
        width: 260,
        height: windowHeight,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1
    }
})
const SCREEN_WIDTH = Dimensions.get("window").width; // Screen width
const SLIDER_WIDTH = SCREEN_WIDTH * 0.75; // Slider width (75% of screen width)
const PrimaHeaderBackup = ({
    left = 0,
    right = 0,
    bottom = 0,
    leftIcon = null,
    rightIcon = null,
    content = "Ride with Romygo",
    isRightIcon = true,
    isContent = true,
    navigation,
    route,
    user = {}
}) => {
    const translateX = useRef(new Animated.Value(-SLIDER_WIDTH)).current; // Initial position offscreen
    const { name: routeName } = route || {}
    // Function to open the slider
    const openSlider = () => {
        Animated.timing(translateX, {
            toValue: 0, // Move slider to fully visible
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    // Function to close the slider
    const closeSlider = () => {
        Animated.timing(translateX, {
            toValue: -SLIDER_WIDTH, // Move slider back offscreen
            duration: 300,
            useNativeDriver: true,
        }).start();
    };
    return (<View style={styles.con}>
        <View style={{ ...styles.container, marginLeft: left, marginRight: right, marginBottom: bottom }}>
            <TouchableOpacity onPress={() => routeName === "Ride" ? openSlider() : navigation.goBack()}><Image source={leftIcon == null ? menu : leftIcon} style={styles.img} /></TouchableOpacity>

            {isContent && <PrimaText
                content={content}
                weight='600'
                size={16}
                color='#2A2A38'
            />}
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
                {isRightIcon ? <Image source={rightIcon == null ? notification : rightIcon} style={styles.img} /> : <View></View>}
            </TouchableOpacity>


        </View>
        <Animated.View style={[styles.slide, { transform: [{ translateX }] },]}>
            <Menu closeSlider={() => closeSlider()} navigation={navigation} route={route} user={user} />
        </Animated.View>
    </View>)
}

export default PrimaHeaderBackup