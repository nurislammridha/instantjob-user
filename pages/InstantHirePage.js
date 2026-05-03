import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    Dimensions,
    Image,
    Modal,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation'
import { useFocusEffect } from '@react-navigation/native'

import PrimaHeader from '../components/PrimaHeader'
import PrimaText from '../components/PrimaText'
import PrimaButton from '../components/PrimaButton'
import Footer from '../components/Footer'
import pointer from '../assets/icons/pointer.png'
import car from '../assets/icons/car.png'
import watch from '../assets/icons/watch.png'
import preferences from '../assets/icons/preferences.png'
import payment from '../assets/icons/payment.png'
import star from '../assets/icons/star.png'
import userAvatar from '../assets/images/man.png'

const windowWidth = Dimensions.get('window').width

const DEFAULT_REGION = {
    latitude: 23.8103,
    longitude: 90.4125,
    latitudeDelta: 0.0422,
    longitudeDelta: 0.0221
}

const CATEGORY_OPTIONS = [
    { id: 'driver', label: 'Driver', icon: car },
    { id: 'cooker', label: 'Cooker', icon: watch },
    { id: 'maintenance', label: 'Maintenance', icon: preferences },
    { id: 'helper', label: 'Helper', icon: pointer },
    { id: 'mechanic', label: 'Mechanic', icon: payment },
    { id: 'cleaner', label: 'Cleaner', icon: star }
]

const PROVIDER_TEMPLATES = [
    {
        id: 'driver-1',
        category: 'driver',
        name: 'Kamal Driver Service',
        role: 'Private Driver',
        rate: '$18 / hour',
        rating: 4.9,
        jobs: 412,
        about: 'Experienced city and long-route driver, available for urgent and scheduled jobs.',
        latOffset: 0.0082,
        lngOffset: 0.0041
    },
    {
        id: 'driver-2',
        category: 'driver',
        name: 'CityRide Pro Team',
        role: 'Professional Driver',
        rate: '$16 / hour',
        rating: 4.7,
        jobs: 289,
        about: 'Reliable drivers for office commute, airport drop, and daily transport support.',
        latOffset: -0.0061,
        lngOffset: 0.0054
    },
    {
        id: 'cooker-1',
        category: 'cooker',
        name: 'Rina Home Kitchen',
        role: 'Home Cooker',
        rate: '$14 / hour',
        rating: 4.8,
        jobs: 351,
        about: 'Specialized in family meals, event prep, and healthy weekly cooking plans.',
        latOffset: 0.0044,
        lngOffset: -0.0066
    },
    {
        id: 'maintenance-1',
        category: 'maintenance',
        name: 'FixRight Maintenance',
        role: 'Home Maintenance',
        rate: '$20 / hour',
        rating: 4.9,
        jobs: 517,
        about: 'Electrical, plumbing, and quick repairs for home and office maintenance.',
        latOffset: -0.0094,
        lngOffset: -0.0037
    },
    {
        id: 'helper-1',
        category: 'helper',
        name: 'FastHelp Assistant',
        role: 'General Helper',
        rate: '$12 / hour',
        rating: 4.6,
        jobs: 238,
        about: 'Daily support for moving, shopping, home setup, and personal assistance tasks.',
        latOffset: 0.007,
        lngOffset: -0.0048
    },
    {
        id: 'mechanic-1',
        category: 'mechanic',
        name: 'Auto Rescue Mechanic',
        role: 'On-site Mechanic',
        rate: '$22 / hour',
        rating: 4.8,
        jobs: 304,
        about: 'Bike and car quick diagnostics, battery support, and emergency roadside service.',
        latOffset: -0.0049,
        lngOffset: 0.008
    },
    {
        id: 'cleaner-1',
        category: 'cleaner',
        name: 'FreshHome Cleaner',
        role: 'House Cleaner',
        rate: '$13 / hour',
        rating: 4.7,
        jobs: 428,
        about: 'Deep cleaning, office cleanup, and weekly routine cleaning by trained staff.',
        latOffset: 0.0033,
        lngOffset: 0.0072
    }
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
        paddingBottom: 30
    },
    mapSection: {
        marginTop: 12,
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#DCE6F2'
    },
    map: {
        width: '100%',
        height: 285
    },
    panel: {
        marginHorizontal: 20,
        marginTop: -34,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2EAF5',
        padding: 16,
        shadowColor: '#1C2533',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6
    },
    locationCard: {
        backgroundColor: '#F2F6FC',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#D8E3F1'
    },
    rowSpace: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    tinyLocationButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#E6F0FF'
    },
    categoryPicker: {
        marginTop: 14,
        borderWidth: 1,
        borderColor: '#D7E3F3',
        borderRadius: 12,
        backgroundColor: '#fff'
    },
    categorySelected: {
        minHeight: 50,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    categoryOption: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#ECF1F8',
        flexDirection: 'row',
        alignItems: 'center'
    },
    categoryIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EAF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    categoryIcon: {
        width: 15,
        height: 15,
        tintColor: '#1D5FC8',
        resizeMode: 'contain'
    },
    providersSection: {
        marginTop: 18,
        marginHorizontal: 20
    },
    providerCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2EAF5',
        padding: 14,
        marginBottom: 10
    },
    providerTop: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12
    },
    metricPillRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    metricPill: {
        width: '31%',
        borderRadius: 10,
        backgroundColor: '#F1F6FD',
        paddingVertical: 8,
        alignItems: 'center'
    },
    emptyCard: {
        marginTop: 10,
        backgroundColor: '#FFF8E5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE39A',
        padding: 12
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(16, 24, 40, 0.45)'
    },
    modalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 18,
        paddingBottom: 24
    }
})

const getDistanceInKm = (from, to) => {
    const earthRadiusKm = 6371
    const dLat = (to.latitude - from.latitude) * (Math.PI / 180)
    const dLng = (to.longitude - from.longitude) * (Math.PI / 180)
    const fromLat = from.latitude * (Math.PI / 180)
    const toLat = to.latitude * (Math.PI / 180)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(fromLat) * Math.cos(toLat)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return earthRadiusKm * c
}

const makeLocationText = ({ latitude, longitude }) =>
    `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`

const InstantHirePage = ({ navigation, route }) => {
    const mapRef = useRef(null)
    const [user, setUser] = useState(null)
    const [mapRegion, setMapRegion] = useState(DEFAULT_REGION)
    const [serviceLocation, setServiceLocation] = useState(DEFAULT_REGION)
    const [serviceLocationText, setServiceLocationText] = useState('Detecting your current location...')
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_OPTIONS[0].id)
    const [isCategoryOpen, setCategoryOpen] = useState(false)
    const [isLocationLoading, setLocationLoading] = useState(true)
    const [providers, setProviders] = useState([])
    const [hasSearched, setHasSearched] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState(null)

    const activeCategory = useMemo(
        () => CATEGORY_OPTIONS.find((item) => item.id === selectedCategory) || CATEGORY_OPTIONS[0],
        [selectedCategory]
    )

    const updateLocation = (coords, animateMap = true) => {
        const nextRegion = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: DEFAULT_REGION.latitudeDelta,
            longitudeDelta: DEFAULT_REGION.longitudeDelta
        }

        setMapRegion(nextRegion)
        setServiceLocation(nextRegion)
        setServiceLocationText(makeLocationText(coords))
        setHasSearched(false)
        setProviders([])

        if (animateMap && mapRef.current) {
            mapRef.current.animateToRegion(nextRegion, 400)
        }
    }

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'Instant Job needs your location to find nearby service providers.',
                    buttonPositive: 'Allow',
                    buttonNegative: 'Deny'
                }
            )

            return granted === PermissionsAndroid.RESULTS.GRANTED
        }

        if (Platform.OS === 'ios' && Geolocation.requestAuthorization) {
            Geolocation.requestAuthorization('whenInUse')
        }

        return true
    }

    const fetchCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission()

        if (!hasPermission) {
            setServiceLocationText('Permission denied. Tap map to set your service location.')
            setLocationLoading(false)
            return
        }

        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                updateLocation({ latitude, longitude })
                setLocationLoading(false)
            },
            () => {
                setServiceLocationText('Could not detect location. Tap map to set your service location.')
                setLocationLoading(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 12000
            }
        )
    }

    useEffect(() => {
        fetchCurrentLocation()
    }, [])

    useFocusEffect(
        useCallback(() => {
            // keep structure aligned with existing pages that load user here
            setUser((prev) => prev)
        }, [])
    )

    const handleFindService = () => {
        const nearby = PROVIDER_TEMPLATES
            .filter((template) => template.category === selectedCategory)
            .map((template) => {
                const coordinate = {
                    latitude: serviceLocation.latitude + template.latOffset,
                    longitude: serviceLocation.longitude + template.lngOffset
                }
                const distanceKm = getDistanceInKm(serviceLocation, coordinate)

                return {
                    ...template,
                    distanceKm,
                    coordinate
                }
            })
            .filter((provider) => provider.distanceKm <= 8)
            .sort((a, b) => a.distanceKm - b.distanceKm)

        setProviders(nearby)
        setHasSearched(true)
    }

    const handleMapPress = (event) => {
        const { coordinate } = event.nativeEvent
        updateLocation(coordinate, false)
    }

    const handleMarkerDragEnd = (event) => {
        const { coordinate } = event.nativeEvent
        updateLocation(coordinate, false)
    }

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <PrimaHeader
                    left={20}
                    right={20}
                    navigation={navigation}
                    route={route}
                    user={user}
                    content='Instant Hire'
                />

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.mapSection}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={mapRegion}
                            onPress={handleMapPress}
                        >
                            <Marker
                                coordinate={serviceLocation}
                                draggable
                                onDragEnd={handleMarkerDragEnd}
                                title='My service location'
                            />

                            {providers.map((provider) => (
                                <Marker
                                    key={provider.id}
                                    coordinate={provider.coordinate}
                                    pinColor='#F59E0B'
                                    title={provider.name}
                                    description={`${provider.role} • ${provider.rate}`}
                                />
                            ))}
                        </MapView>
                    </View>

                    <View style={styles.panel}>
                        <View style={styles.locationCard}>
                            <View style={styles.rowSpace}>
                                <PrimaText content='My service location' size={14} weight='600' color='#1F2E44' />
                                <TouchableOpacity
                                    style={styles.tinyLocationButton}
                                    activeOpacity={0.85}
                                    onPress={fetchCurrentLocation}
                                >
                                    <PrimaText content='Use current' size={11} weight='600' color='#0C5BC2' />
                                </TouchableOpacity>
                            </View>
                            <PrimaText
                                content={isLocationLoading ? 'Detecting your current location...' : serviceLocationText}
                                size={12}
                                weight='400'
                                color='#5D708A'
                                top={6}
                            />
                            <PrimaText
                                content='Tip: tap or drag marker on map to adjust location.'
                                size={11}
                                weight='400'
                                color='#8293A9'
                                top={4}
                            />
                        </View>

                        <View style={styles.categoryPicker}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.categorySelected}
                                onPress={() => setCategoryOpen(!isCategoryOpen)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.categoryIconWrap}>
                                        <Image source={activeCategory.icon} style={styles.categoryIcon} />
                                    </View>
                                    <View>
                                        <PrimaText content='Service Category' size={11} weight='500' color='#7A8EA8' />
                                        <PrimaText content={activeCategory.label} size={14} weight='600' color='#1F2E44' top={2} />
                                    </View>
                                </View>
                                <PrimaText content={isCategoryOpen ? '▲' : '▼'} size={12} weight='700' color='#1F2E44' />
                            </TouchableOpacity>

                            {isCategoryOpen && CATEGORY_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    activeOpacity={0.85}
                                    style={styles.categoryOption}
                                    onPress={() => {
                                        setSelectedCategory(option.id)
                                        setCategoryOpen(false)
                                    }}
                                >
                                    <View style={styles.categoryIconWrap}>
                                        <Image source={option.icon} style={styles.categoryIcon} />
                                    </View>
                                    <PrimaText content={option.label} size={14} weight='500' color='#233A5B' />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <PrimaButton
                            content='Find Service'
                            height={54}
                            radius={12}
                            bgColor='#0C5BC2'
                            color='#FFFFFF'
                            weight='700'
                            size={16}
                            top={14}
                            onPress={handleFindService}
                        />
                    </View>

                    <View style={styles.providersSection}>
                        <PrimaText
                            content={hasSearched ? 'Service Providers In This Area' : 'Find providers near your location'}
                            size={16}
                            weight='600'
                            color='#1E2E45'
                        />

                        {hasSearched && providers.length === 0 && (
                            <View style={styles.emptyCard}>
                                <PrimaText
                                    content='No provider found in this area for the selected category.'
                                    size={13}
                                    weight='500'
                                    color='#7A5410'
                                />
                                <PrimaText
                                    content='Try moving the map marker or changing category and search again.'
                                    size={12}
                                    weight='400'
                                    color='#9B6D1D'
                                    top={4}
                                />
                            </View>
                        )}

                        {providers.map((provider) => (
                            <TouchableOpacity
                                key={provider.id}
                                activeOpacity={0.9}
                                style={styles.providerCard}
                                onPress={() => setSelectedProvider(provider)}
                            >
                                <View style={styles.providerTop}>
                                    <Image source={userAvatar} style={styles.avatar} />
                                    <View style={{ flex: 1 }}>
                                        <PrimaText content={provider.name} size={15} weight='700' color='#1A2C45' />
                                        <PrimaText content={provider.role} size={12} weight='500' color='#5F7592' top={2} />
                                    </View>
                                </View>

                                <View style={styles.metricPillRow}>
                                    <View style={styles.metricPill}>
                                        <PrimaText content={provider.rating.toFixed(1)} size={13} weight='700' color='#203553' />
                                        <PrimaText content='Rating' size={11} weight='400' color='#5F7592' top={2} />
                                    </View>
                                    <View style={styles.metricPill}>
                                        <PrimaText content={`${provider.distanceKm.toFixed(1)} km`} size={13} weight='700' color='#203553' />
                                        <PrimaText content='Distance' size={11} weight='400' color='#5F7592' top={2} />
                                    </View>
                                    <View style={styles.metricPill}>
                                        <PrimaText content={provider.rate} size={13} weight='700' color='#203553' />
                                        <PrimaText content='Starting' size={11} weight='400' color='#5F7592' top={2} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            <Footer navigation={navigation} route={route} />

            <Modal
                visible={!!selectedProvider}
                animationType='slide'
                transparent
                onRequestClose={() => setSelectedProvider(null)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.modalBackdrop}
                    onPress={() => setSelectedProvider(null)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => { }}>
                        {!!selectedProvider && (
                            <>
                                <View style={styles.providerTop}>
                                    <Image source={userAvatar} style={styles.avatar} />
                                    <View style={{ flex: 1 }}>
                                        <PrimaText content={selectedProvider.name} size={17} weight='700' color='#172A45' />
                                        <PrimaText content={selectedProvider.role} size={13} weight='500' color='#5E7490' top={3} />
                                    </View>
                                </View>

                                <PrimaText content={selectedProvider.about} size={13} weight='400' color='#526C89' top={12} />

                                <View style={styles.metricPillRow}>
                                    <View style={styles.metricPill}>
                                        <PrimaText content={selectedProvider.rating.toFixed(1)} size={13} weight='700' color='#203553' />
                                        <PrimaText content='Rating' size={11} weight='400' color='#5F7592' top={2} />
                                    </View>
                                    <View style={styles.metricPill}>
                                        <PrimaText content={`${selectedProvider.jobs}`} size={13} weight='700' color='#203553' />
                                        <PrimaText content='Completed' size={11} weight='400' color='#5F7592' top={2} />
                                    </View>
                                    <View style={styles.metricPill}>
                                        <PrimaText content={selectedProvider.rate} size={13} weight='700' color='#203553' />
                                        <PrimaText content='Rate' size={11} weight='400' color='#5F7592' top={2} />
                                    </View>
                                </View>

                                <PrimaButton
                                    content='Request Service'
                                    height={54}
                                    radius={12}
                                    bgColor='#FFCA00'
                                    color='#2A2A38'
                                    weight='700'
                                    size={16}
                                    top={16}
                                    onPress={() => setSelectedProvider(null)}
                                />
                            </>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default InstantHirePage