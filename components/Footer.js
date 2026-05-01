import React from 'react'
import { Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import home from '../assets/icons/home.png'
import homeActive from '../assets/icons/homeSelected.png'
import instant from '../assets/icons/watch.png'
import activity from '../assets/icons/activity.png'
import activityActive from '../assets/icons/activitySelected.png'
import user from '../assets/icons/user.png'
import userActive from '../assets/icons/profileSelected.png'
import PrimaText from './PrimaText'

const ACTIVE_COLOR = '#0062E3'

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: '#252535',
        minHeight: 85,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 22 : 10,
        borderTopWidth: 1,
        borderTopColor: '#3A3A4D',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 16
    },
    tabButton: {
        width: '24%'
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingVertical: 8
    },
    itemActive: {
        backgroundColor: 'rgba(0, 98, 227, 0.14)'
    },
    img: {
        width: 24,
        height: 24,
        resizeMode: 'contain'
    },
    ridesInactiveIcon: {
        tintColor: '#fff'
    },
    ridesActiveIcon: {
        tintColor: ACTIVE_COLOR
    }
})

const Footer = ({ navigation, route }) => {
    const { name: routeName } = route || {}
    const isHomeRoute = routeName === 'Home'
    const isLiveRideRoute = routeName === 'LiveRide'
    const isActivitiesRoute = routeName === 'Activities'
    const isProfileRoute = routeName === 'Profile'

    return (
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={0.85} style={styles.tabButton} onPress={() => navigation.navigate('Home')}>
                <View style={[styles.item, isHomeRoute && styles.itemActive]}>
                    <Image source={isHomeRoute ? homeActive : home} style={styles.img} />
                    <PrimaText
                        content='Home'
                        weight='500'
                        size={14}
                        color={isHomeRoute ? ACTIVE_COLOR : '#fff'}
                        top={5}
                    />
                </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={styles.tabButton} onPress={() => navigation.navigate('LiveRide')}>
                <View style={[styles.item, isLiveRideRoute && styles.itemActive]}>
                    <Image
                        source={instant}
                        style={[styles.img, isLiveRideRoute ? styles.ridesActiveIcon : styles.ridesInactiveIcon]}
                    />
                    <PrimaText
                        content='Instant Hire'
                        weight='500'
                        size={14}
                        color={isLiveRideRoute ? ACTIVE_COLOR : '#fff'}
                        top={5}
                    />
                </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={styles.tabButton} onPress={() => navigation.navigate('Activities')}>
                <View style={[styles.item, isActivitiesRoute && styles.itemActive]}>
                    <Image source={isActivitiesRoute ? activityActive : activity} style={styles.img} />
                    <PrimaText
                        content='Activity'
                        weight='500'
                        size={14}
                        color={isActivitiesRoute ? ACTIVE_COLOR : '#fff'}
                        top={5}
                    />
                </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={styles.tabButton} onPress={() => navigation.navigate('Profile')}>
                <View style={[styles.item, isProfileRoute && styles.itemActive]}>
                    <Image source={isProfileRoute ? userActive : user} style={styles.img} />
                    <PrimaText
                        content='Account'
                        weight='500'
                        size={14}
                        color={isProfileRoute ? ACTIVE_COLOR : '#fff'}
                        top={5}
                    />
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default Footer