import React, { useCallback, useMemo, useState } from 'react'
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import PrimaHeader from '../components/PrimaHeader'
import Footer from '../components/Footer'
import GoingInput from '../components/GoingInput'
import PrimaText from '../components/PrimaText'
import watch from '../assets/icons/watch.png'
import payment from '../assets/icons/payment.png'
import car from '../assets/icons/car.png'
import preferences from '../assets/icons/preferences.png'
import star from '../assets/icons/star.png'
import pointer from '../assets/icons/pointer.png'

import { useFocusEffect } from '@react-navigation/native'
const windowWidth = Dimensions.get('window').width

const SERVICE_OPTIONS = [
    {
        key: 'instant',
        label: 'Instant Job',
        title: 'Get a skilled worker in minutes',
        description: 'Perfect for urgent home and office tasks. Share your need and get matched quickly.'
    },
    {
        key: 'scheduled',
        label: 'Scheduled Job',
        title: 'Plan your service ahead',
        description: 'Book trusted workers for a specific date and time with transparent pricing.'
    },
    {
        key: 'post',
        label: 'Post your Job',
        title: 'Post once, receive multiple offers',
        description: 'Describe your task and compare offers from qualified workers before hiring.'
    }
]

const JOB_CATEGORIES = [
    { id: 'driver', name: 'Driver', icon: car },
    { id: 'cooker', name: 'Cooker', icon: watch },
    { id: 'maintenance', name: 'Maintenance', icon: preferences },
    { id: 'helper', name: 'Helper', icon: pointer },
    { id: 'mechanic', name: 'Mechanic', icon: payment },
    { id: 'cleaner', name: 'Cleaner', icon: star }
]

const HOW_IT_WORKS = [
    { id: 'post', title: '1. Select Service', text: 'Choose Instant, Scheduled, or Post your Job based on your need.' },
    { id: 'match', title: '2. Get Matched', text: 'We connect you with available trusted workers in your area.' },
    { id: 'hire', title: '3. Hire & Track', text: 'Confirm your worker, follow progress, and pay after completion.' }
]

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7FB'
    },
    body: {
        flex: 1,
        paddingTop: 12
    },
    scrollContent: {
        paddingBottom: 22
    },
    heroCard: {
        marginTop: 18,
        marginHorizontal: 20,
        paddingVertical: 20,
        paddingHorizontal: 18,
        borderRadius: 18,
        backgroundColor: '#0A5CC1',
        overflow: 'hidden'
    },
    heroCircleLarge: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        top: -58,
        right: -42,
        backgroundColor: 'rgba(255,255,255,0.18)'
    },
    heroCircleSmall: {
        position: 'absolute',
        width: 92,
        height: 92,
        borderRadius: 46,
        bottom: -36,
        right: 40,
        backgroundColor: 'rgba(255,255,255,0.15)'
    },
    heroStatsRow: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 10
    },
    heroStat: {
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10
    },
    serviceSection: {
        marginTop: 18,
        marginHorizontal: 20
    },
    serviceButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12
    },
    serviceButton: {
        width: (windowWidth - 54) / 3,
        minHeight: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D8E2F0',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6
    },
    serviceButtonActive: {
        backgroundColor: '#0A5CC1',
        borderColor: '#0A5CC1'
    },
    serviceInfoCard: {
        marginTop: 14,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E1E9F5'
    },
    categoriesSection: {
        marginTop: 18,
        marginHorizontal: 20
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10
    },
    categoryCard: {
        width: (windowWidth - 60) / 3,
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E3EAF4',
        alignItems: 'center'
    },
    categoryIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#EAF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    categoryIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        tintColor: '#0A5CC1'
    },
    flowSection: {
        marginTop: 8,
        marginHorizontal: 20
    },
    flowCard: {
        marginTop: 10,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E3EAF4'
    }
})

const Home = ({ navigation, route }) => {
    const [user, setUser] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeService, setActiveService] = useState('instant')

    const selectedService = useMemo(
        () => SERVICE_OPTIONS.find((item) => item.key === activeService) || SERVICE_OPTIONS[0],
        [activeService]
    )

    useFocusEffect(
        useCallback(() => {
            // getData("user").then((res) => {
            //     res && setUser(res);
            // });
        }, [])
    )

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <PrimaHeader
                    left={20}
                    right={20}
                    navigation={navigation}
                    route={route}
                    user={user}
                />
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.heroCard}>
                        <View style={styles.heroCircleLarge} />
                        <View style={styles.heroCircleSmall} />
                        <PrimaText
                            content='Instant Job'
                            weight='700'
                            size={24}
                            color='#FFFFFF'
                        />
                        <PrimaText
                            content='Find trusted workers for your daily tasks, urgent fixes, and scheduled services.'
                            weight='400'
                            size={14}
                            color='#DDEBFF'
                            top={8}
                            width='85%'
                        />
                        <View style={styles.heroStatsRow}>
                            <View style={styles.heroStat}>
                                <PrimaText content='5,000+' size={13} weight='700' color='#fff' />
                                <PrimaText content='Active workers' size={12} weight='400' color='#DDEBFF' top={2} />
                            </View>
                            <View style={styles.heroStat}>
                                <PrimaText content='24/7' size={13} weight='700' color='#fff' />
                                <PrimaText content='Instant support' size={12} weight='400' color='#DDEBFF' top={2} />
                            </View>
                        </View>
                    </View>

                    <GoingInput
                        top={16}
                        left={20}
                        right={20}
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />

                    <View style={styles.serviceSection}>
                        <PrimaText
                            content='Select Service Type'
                            weight='600'
                            size={16}
                            color='#1E2E45'
                        />
                        <View style={styles.serviceButtonsRow}>
                            {SERVICE_OPTIONS.map((service) => {
                                const isActive = service.key === activeService

                                return (
                                    <TouchableOpacity
                                        key={service.key}
                                        activeOpacity={0.9}
                                        style={[styles.serviceButton, isActive && styles.serviceButtonActive]}
                                        onPress={() => setActiveService(service.key)}
                                    >
                                        <PrimaText
                                            content={service.label}
                                            size={13}
                                            weight='600'
                                            align='center'
                                            color={isActive ? '#FFFFFF' : '#335073'}
                                        />
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                        <View style={styles.serviceInfoCard}>
                            <PrimaText
                                content={selectedService.title}
                                size={16}
                                weight='600'
                                color='#1E2E45'
                            />
                            <PrimaText
                                content={selectedService.description}
                                size={13}
                                weight='400'
                                color='#607089'
                                top={6}
                            />
                        </View>
                    </View>

                    <View style={styles.categoriesSection}>
                        <PrimaText
                            content='Job Categories'
                            weight='600'
                            size={16}
                            color='#1E2E45'
                        />
                        <View style={styles.categoryGrid}>
                            {JOB_CATEGORIES.map((category) => (
                                <TouchableOpacity key={category.id} activeOpacity={0.9} style={styles.categoryCard}>
                                    <View style={styles.categoryIconWrap}>
                                        <Image source={category.icon} style={styles.categoryIcon} />
                                    </View>
                                    <PrimaText
                                        content={category.name}
                                        size={13}
                                        weight='600'
                                        align='center'
                                        color='#223B5D'
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.flowSection}>
                        <PrimaText
                            content='How Instant Job Works'
                            weight='600'
                            size={16}
                            color='#1E2E45'
                        />
                        {HOW_IT_WORKS.map((item) => (
                            <View key={item.id} style={styles.flowCard}>
                                <PrimaText
                                    content={item.title}
                                    size={14}
                                    weight='600'
                                    color='#1E2E45'
                                />
                                <PrimaText
                                    content={item.text}
                                    size={12}
                                    weight='400'
                                    color='#67809C'
                                    top={4}
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
            <Footer navigation={navigation} route={route} />
        </View>
    )
}

export default Home