import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import man from '../assets/images/man.png'
import star from '../assets/icons/star.png'
import watch from '../assets/icons/watch.png'
import love from '../assets/icons/love.png'
import payment from '../assets/icons/payment.png'
import notification from '../assets/icons/notification.png'
import preferences from '../assets/icons/preferences.png'
import faq from '../assets/icons/faq.png'
import logout from '../assets/icons/logout.png'
import cross from '../assets/icons/cross.png'
import PrimaText from './PrimaText'
import { storeData } from '../assets/functions/helperFunction'
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    top: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    left: {
        display: 'flex',
        flexDirection: 'row'
    },
    man: {
        width: 52,
        height: 52,
        marginRight: 10,
        borderRadius: 26
    },
    starCon: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    star: { width: 20, height: 20 },
    cross: { width: 24, height: 24 },
    bot: { marginTop: 30 },
    item: {
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        display: 'flex',
        flexDirection: 'row'
    },
    itemImg: { width: 24, height: 24, marginRight: 16 }
})
const Menu = ({ closeSlider, navigation, route, user }) => {
    const handleLogout = () => {
        closeSlider()
        storeData("access_token", "")
        storeData("user", {})
        storeData("isLogin", false)
        navigation.navigate("Login")
    }
    // console.log('user', user)
    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <View style={styles.left}>
                    <Image source={user ? { uri: user?.avatar } : man} style={styles.man} />
                    <View>
                        <PrimaText
                            content={user?.name || "Jack Smith"}
                            color='#2A2A38'
                            weight='500'
                            size={14}
                            bottom={10}
                        />
                        <View style={styles.starCon}>
                            <Image source={star} style={styles.star} />
                            <PrimaText
                                content={user?.rating ? user.rating.average : "4.8"}
                                weight='600'
                                size={14}
                                color='#2A2A38'
                                left={4}
                            />
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={closeSlider}>
                    <Image source={cross} style={styles.cross} />
                </TouchableOpacity>

            </View>
            <View style={styles.bot}>
                <TouchableOpacity
                    onPress={() => {
                        // alert("Under developing")
                        navigation.navigate("Activities")
                        closeSlider()
                    }}
                >
                    <View style={styles.item}>
                        <Image source={watch} style={styles.itemImg} />
                        <PrimaText
                            content='Ride History'
                            color='#2A2A38'
                            weight='500'
                            size={14}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("FavouriteLocation")
                        closeSlider()
                    }}
                >
                    <View style={styles.item}>
                        <Image source={love} style={styles.itemImg} />
                        <PrimaText
                            content='Favourite Locations '
                            color='#2A2A38'
                            weight='500'
                            size={14}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("Payment")
                        closeSlider()
                    }}
                >
                    <View style={styles.item}>
                        <Image source={payment} style={styles.itemImg} />
                        <PrimaText
                            content='Payment Methods'
                            color='#2A2A38'
                            weight='500'
                            size={14}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("Notifications")
                        closeSlider()
                    }}
                >
                    <View style={styles.item}>
                        <Image source={notification} style={styles.itemImg} />
                        <PrimaText
                            content='Notifications'
                            color='#2A2A38'
                            weight='500'
                            size={14}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("Preferences")
                        closeSlider()
                    }}
                >
                    <View style={styles.item}>
                        <Image source={preferences} style={styles.itemImg} />
                        <PrimaText
                            content='Preferences'
                            color='#2A2A38'
                            weight='500'
                            size={14}
                        />
                    </View>
                </TouchableOpacity>
                <View style={styles.item}>
                    <Image source={faq} style={styles.itemImg} />
                    <PrimaText
                        content='FAQ'
                        color='#2A2A38'
                        weight='500'
                        size={14}
                    />
                </View>
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => handleLogout()}
                >
                    <Image source={logout} style={styles.itemImg} />
                    <PrimaText
                        content='Logout'
                        color='#2A2A38'
                        weight='500'
                        size={14}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Menu