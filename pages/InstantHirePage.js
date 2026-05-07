import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import Geolocation from '@react-native-community/geolocation'
import { useFocusEffect } from '@react-navigation/native'

import PrimaHeader from '../components/PrimaHeader'
import PrimaText from '../components/PrimaText'
import Footer from '../components/Footer'
import pointer from '../assets/icons/pointer.png'
import car from '../assets/icons/car.png'
import watch from '../assets/icons/watch.png'
import preferences from '../assets/icons/preferences.png'
import payment from '../assets/icons/payment.png'
import star from '../assets/icons/star.png'
import avatar1 from '../assets/images/man.png'
import avatar2 from '../assets/images/rom1.png'
import avatar3 from '../assets/images/rom2.png'
import avatar4 from '../assets/images/rom11.png'
import avatar5 from '../assets/images/rom22.png'

// Replace with your real Google Places API key
const GOOGLE_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY'

const { height: screenHeight } = Dimensions.get('window')

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

// Fallback location suggestions for demo / when API key not set
const FALLBACK_SUGGESTIONS = [
    { place_id: 'f1', description: 'Gulshan, Dhaka, Bangladesh', lat: 23.7925, lng: 90.4078 },
    { place_id: 'f2', description: 'Banani, Dhaka, Bangladesh', lat: 23.7935, lng: 90.4040 },
    { place_id: 'f3', description: 'Dhanmondi, Dhaka, Bangladesh', lat: 23.7461, lng: 90.3742 },
    { place_id: 'f4', description: 'Motijheel, Dhaka, Bangladesh', lat: 23.7297, lng: 90.4177 },
    { place_id: 'f5', description: 'Mirpur, Dhaka, Bangladesh', lat: 23.8223, lng: 90.3654 },
    { place_id: 'f6', description: 'Uttara, Dhaka, Bangladesh', lat: 23.8759, lng: 90.3795 },
    { place_id: 'f7', description: 'Mohammadpur, Dhaka, Bangladesh', lat: 23.7643, lng: 90.3527 },
    { place_id: 'f8', description: 'Tejgaon, Dhaka, Bangladesh', lat: 23.7641, lng: 90.3905 },
    { place_id: 'f9', description: 'Pallabi, Dhaka, Bangladesh', lat: 23.8274, lng: 90.3588 },
    { place_id: 'f10', description: 'Purana Paltan, Dhaka, Bangladesh', lat: 23.7366, lng: 90.4146 },
]

const AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5]

const DEMO_WORKERS = [
    { id: 'w1', category: 'driver', name: 'Rafiqul Islam', experience: 7, rate: 450, distance: 1.2 },
    { id: 'w2', category: 'driver', name: 'Jahangir Alam', experience: 4, rate: 380, distance: 2.1 },
    { id: 'w3', category: 'driver', name: 'Kamal Hossain', experience: 10, rate: 520, distance: 3.4 },
    { id: 'w4', category: 'cooker', name: 'Rina Begum', experience: 6, rate: 350, distance: 0.8 },
    { id: 'w5', category: 'cooker', name: 'Salma Khatun', experience: 3, rate: 280, distance: 1.9 },
    { id: 'w6', category: 'cooker', name: 'Nasima Akter', experience: 8, rate: 420, distance: 2.7 },
    { id: 'w7', category: 'maintenance', name: 'Anwar Hossain', experience: 9, rate: 550, distance: 1.1 },
    { id: 'w8', category: 'maintenance', name: 'Belal Ahmed', experience: 5, rate: 480, distance: 2.3 },
    { id: 'w9', category: 'maintenance', name: 'Nizam Uddin', experience: 12, rate: 600, distance: 3.8 },
    { id: 'w10', category: 'helper', name: 'Sumon Mia', experience: 2, rate: 250, distance: 0.6 },
    { id: 'w11', category: 'helper', name: 'Rakib Hasan', experience: 1, rate: 220, distance: 1.4 },
    { id: 'w12', category: 'helper', name: 'Sharif Mia', experience: 4, rate: 300, distance: 2.9 },
    { id: 'w13', category: 'mechanic', name: 'Habibur Rahman', experience: 8, rate: 600, distance: 1.5 },
    { id: 'w14', category: 'mechanic', name: 'Ataur Rahman', experience: 6, rate: 520, distance: 2.2 },
    { id: 'w15', category: 'mechanic', name: 'Mojibur Rahman', experience: 11, rate: 680, distance: 3.1 },
    { id: 'w16', category: 'cleaner', name: 'Kohinoor Begum', experience: 3, rate: 280, distance: 0.9 },
    { id: 'w17', category: 'cleaner', name: 'Nazma Khatun', experience: 5, rate: 320, distance: 1.7 },
    { id: 'w18', category: 'cleaner', name: 'Rokeya Akter', experience: 7, rate: 380, distance: 2.5 },
]

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FB' },
    body: { flex: 1 },

    panel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        padding: 16,
        paddingBottom: 22,
        shadowColor: '#0D1A2D',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
        elevation: 12
    },

    // Picker (location + category)
    pickerBox: {
        borderWidth: 1,
        borderColor: '#D7E3F3',
        borderRadius: 12,
        backgroundColor: '#FAFCFF',
        marginBottom: 10,
        overflow: 'hidden'
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 11,
        minHeight: 58
    },
    pickerIconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#E8F1FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11
    },
    pickerIconImg: {
        width: 15,
        height: 15,
        tintColor: '#1D5FC8',
        resizeMode: 'contain'
    },
    pickerMeta: { flex: 1, marginRight: 4 },
    pickerLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#8BA3C0',
        letterSpacing: 0.3,
        marginBottom: 2
    },
    pickerValue: { fontSize: 14, fontWeight: '600', color: '#1F2E44' },
    pickerPlaceholder: { fontSize: 13, fontWeight: '400', color: '#B0C2D8' },
    pickerArrow: { fontSize: 10, color: '#6B87A8' },

    categoryDivider: { height: 1, backgroundColor: '#EEF3FA' },
    categoryOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 11
    },
    categoryOptionText: { fontSize: 14, fontWeight: '500', color: '#233A5B', marginLeft: 10 },

    // Find service button
    findBtn: {
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    findBtnActive: { backgroundColor: '#0C5BC2' },
    findBtnDim: { backgroundColor: '#C2D4EF' },
    findBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

    // Shared modal backdrop
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(10, 20, 38, 0.52)',
        justifyContent: 'flex-end'
    },

    // Drag handle
    dragHandle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D4E0F0',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 12
    },

    // Shared sheet header
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        paddingHorizontal: 2
    },
    sheetTitle: { fontSize: 17, fontWeight: '700', color: '#1A2C45' },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F0F5FA',
        alignItems: 'center',
        justifyContent: 'center'
    },
    closeBtnText: { fontSize: 15, color: '#5F7592', fontWeight: '600', lineHeight: 20 },

    // Location modal
    locationSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingBottom: 28,
        maxHeight: screenHeight * 0.74
    },
    searchInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F6FC',
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#DCE8F6',
        marginBottom: 10
    },
    searchInputIcon: {
        width: 15,
        height: 15,
        tintColor: '#7A8EA8',
        resizeMode: 'contain',
        marginRight: 8
    },
    searchInputField: { flex: 1, height: 44, fontSize: 14, color: '#1F2E44' },
    useCurrentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF3FA',
        marginBottom: 4
    },
    useCurrentIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#EBF3FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    useCurrentIcon: { width: 13, height: 13, tintColor: '#0C5BC2', resizeMode: 'contain' },
    useCurrentText: { fontSize: 14, fontWeight: '600', color: '#0C5BC2' },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F5FB'
    },
    suggestionIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#F0F5FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    suggestionIcon: { width: 13, height: 13, tintColor: '#4B6A8B', resizeMode: 'contain' },
    suggestionText: { flex: 1, fontSize: 13, fontWeight: '400', color: '#2D4465', lineHeight: 18 },
    noResultText: { fontSize: 13, color: '#8BA3C0', textAlign: 'center', paddingVertical: 20 },

    // Workers modal
    workersSheet: {
        backgroundColor: '#F4F7FB',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: screenHeight * 0.78
    },
    workersSheetTopBar: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E8F0FA'
    },
    workersSheetHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    workersSheetTitle: { fontSize: 16, fontWeight: '700', color: '#1A2C45' },
    workerCountBadge: {
        backgroundColor: '#0C5BC2',
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
        marginLeft: 6
    },
    workerCountText: { fontSize: 11, fontWeight: '700', color: '#fff' },
    workersSubtitle: { fontSize: 12, color: '#7A8EA8', marginTop: 3 },
    workersListContent: { paddingHorizontal: 14, paddingTop: 12 },
    workerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: '#E4EFF9',
        shadowColor: '#1C2533',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    workerCardSelected: {
        borderColor: '#0C5BC2',
        backgroundColor: '#F0F6FF'
    },
    workerAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#D9E8F9'
    },
    workerInfo: { flex: 1, marginLeft: 12 },
    workerName: { fontSize: 15, fontWeight: '700', color: '#1A2C45' },
    workerExp: { fontSize: 12, fontWeight: '400', color: '#6B87A8', marginTop: 2 },
    workerRate: { fontSize: 13, fontWeight: '600', color: '#0C5BC2', marginTop: 3 },
    workerDist: { fontSize: 11, fontWeight: '500', color: '#16A34A', marginTop: 2 },
    selectCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: '#C8D8EC',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8
    },
    selectCircleActive: { borderColor: '#0C5BC2', backgroundColor: '#0C5BC2' },
    checkmark: { fontSize: 13, color: '#fff', fontWeight: '700' },
    workersFooter: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        paddingBottom: 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E4EFF9'
    },
    sendBtn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    sendBtnActive: { backgroundColor: '#FFCA00' },
    sendBtnDim: { backgroundColor: '#EEF3FA' },
    sendBtnTextActive: { fontSize: 16, fontWeight: '700', color: '#1A2C45' },
    sendBtnTextDim: { fontSize: 16, fontWeight: '700', color: '#A8BEDB' }
})

const InstantHirePage = ({ navigation, route }) => {
    const mapRef = useRef(null)
    const searchDebounce = useRef(null)

    const [user, setUser] = useState(null)
    const [mapRegion, setMapRegion] = useState(DEFAULT_REGION)
    const [serviceLocation, setServiceLocation] = useState(DEFAULT_REGION)
    const [isLocationLoading, setLocationLoading] = useState(true)

    // Location picker
    const [selectedLocationText, setSelectedLocationText] = useState(null)
    const [isLocationModalVisible, setLocationModalVisible] = useState(false)
    const [locationSearchQuery, setLocationSearchQuery] = useState('')
    const [locationSuggestions, setLocationSuggestions] = useState([])
    const [isSuggestionsLoading, setSuggestionsLoading] = useState(false)

    // Category picker
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isCategoryOpen, setCategoryOpen] = useState(false)

    // Find service flow
    const [isFindServiceLoading, setFindServiceLoading] = useState(false)
    const [isWorkersModalVisible, setWorkersModalVisible] = useState(false)
    const [nearbyWorkers, setNearbyWorkers] = useState([])
    const [selectedWorkerIds, setSelectedWorkerIds] = useState([])

    const activeCategory = useMemo(
        () => CATEGORY_OPTIONS.find((item) => item.id === selectedCategory),
        [selectedCategory]
    )

    const canFindService = selectedLocationText !== null && selectedCategory !== null

    // ── Location helpers ──────────────────────────────────────────────────────

    const updateMapRegion = (coords, animate = true) => {
        const region = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: DEFAULT_REGION.latitudeDelta,
            longitudeDelta: DEFAULT_REGION.longitudeDelta
        }
        setMapRegion(region)
        setServiceLocation(region)
        if (animate && mapRef.current) mapRef.current.animateToRegion(region, 400)
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
            setLocationLoading(false)
            return
        }
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                updateMapRegion({ latitude, longitude })
                setLocationLoading(false)
            },
            () => setLocationLoading(false),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 12000 }
        )
    }

    useEffect(() => { fetchCurrentLocation() }, [])

    useFocusEffect(
        useCallback(() => { setUser((prev) => prev) }, [])
    )

    // ── Search suggestions ────────────────────────────────────────────────────

    const fetchSuggestions = async (query) => {
        if (!query || query.trim().length < 2) {
            setLocationSuggestions([])
            return
        }
        setSuggestionsLoading(true)

        if (GOOGLE_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY') {
            try {
                const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&language=en`
                const res = await fetch(url)
                const data = await res.json()
                if (data.status === 'OK') {
                    setLocationSuggestions(
                        data.predictions.map((p) => ({
                            place_id: p.place_id,
                            description: p.description,
                            lat: null,
                            lng: null
                        }))
                    )
                    setSuggestionsLoading(false)
                    return
                }
            } catch (_) { /* fall through */ }
        }

        // Fallback: filter static list
        const filtered = FALLBACK_SUGGESTIONS.filter((s) =>
            s.description.toLowerCase().includes(query.toLowerCase())
        )
        setLocationSuggestions(filtered)
        setSuggestionsLoading(false)
    }

    const handleLocationSearchChange = (text) => {
        setLocationSearchQuery(text)
        clearTimeout(searchDebounce.current)
        searchDebounce.current = setTimeout(() => fetchSuggestions(text), 400)
    }

    const resolveAndSelectSuggestion = async (suggestion) => {
        let coords = { latitude: serviceLocation.latitude, longitude: serviceLocation.longitude }

        if (suggestion.lat && suggestion.lng) {
            coords = { latitude: suggestion.lat, longitude: suggestion.lng }
        } else if (GOOGLE_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY') {
            try {
                const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&fields=geometry&key=${GOOGLE_API_KEY}`
                const res = await fetch(url)
                const data = await res.json()
                if (data.status === 'OK') {
                    coords = {
                        latitude: data.result.geometry.location.lat,
                        longitude: data.result.geometry.location.lng
                    }
                }
            } catch (_) { /* fall through */ }
        }

        updateMapRegion(coords)
        setSelectedLocationText(suggestion.description)
        closeLocationModal()
    }

    const handleUseCurrentLocation = () => {
        setSelectedLocationText('My Current Location')
        closeLocationModal()
    }

    const closeLocationModal = () => {
        setLocationModalVisible(false)
        setLocationSearchQuery('')
        setLocationSuggestions([])
    }

    // ── Map interactions ──────────────────────────────────────────────────────

    const handleMapPress = (event) => {
        const { coordinate } = event.nativeEvent
        updateMapRegion(coordinate, false)
        setSelectedLocationText('Selected on Map')
    }

    const handleMarkerDragEnd = (event) => {
        const { coordinate } = event.nativeEvent
        updateMapRegion(coordinate, false)
        setSelectedLocationText('Selected on Map')
    }

    // ── Find service ──────────────────────────────────────────────────────────

    const handleFindService = () => {
        if (!canFindService || isFindServiceLoading) return
        setFindServiceLoading(true)
        setTimeout(() => {
            const workers = DEMO_WORKERS.filter((w) => w.category === selectedCategory)
            setNearbyWorkers(workers)
            setSelectedWorkerIds([])
            setFindServiceLoading(false)
            setWorkersModalVisible(true)
        }, 3000)
    }

    const handleToggleWorker = (id) => {
        setSelectedWorkerIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const handleSendRequest = () => {
        setWorkersModalVisible(false)
        setSelectedWorkerIds([])
    }

    // ── Render ────────────────────────────────────────────────────────────────

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

                <MapView
                        ref={mapRef}
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={mapRegion}
                        onPress={handleMapPress}
                    >
                        <Marker
                            coordinate={serviceLocation}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                            title='Service location'
                        />
                    </MapView>

                    {/* Panel pinned above footer */}
                    <View style={styles.panel}>
                        {/* Select service location */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.pickerBox}
                            onPress={() => setLocationModalVisible(true)}
                        >
                            <View style={styles.pickerRow}>
                                <View style={styles.pickerIconBox}>
                                    <Image source={pointer} style={styles.pickerIconImg} />
                                </View>
                                <View style={styles.pickerMeta}>
                                    <Text style={styles.pickerLabel}>SERVICE LOCATION</Text>
                                    {selectedLocationText ? (
                                        <Text style={styles.pickerValue} numberOfLines={1} ellipsizeMode='tail'>
                                            {selectedLocationText}
                                        </Text>
                                    ) : (
                                        <Text style={styles.pickerPlaceholder}>Select service location</Text>
                                    )}
                                </View>
                                <Text style={styles.pickerArrow}>▼</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Select category */}
                        <View style={styles.pickerBox}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.pickerRow}
                                onPress={() => setCategoryOpen(!isCategoryOpen)}
                            >
                                <View style={[styles.pickerIconBox, !activeCategory && { backgroundColor: '#F0F4FA' }]}>
                                    {activeCategory ? (
                                        <Image source={activeCategory.icon} style={styles.pickerIconImg} />
                                    ) : (
                                        <Text style={{ fontSize: 16, color: '#A0B0C8' }}>☰</Text>
                                    )}
                                </View>
                                <View style={styles.pickerMeta}>
                                    <Text style={styles.pickerLabel}>SERVICE CATEGORY</Text>
                                    {activeCategory ? (
                                        <Text style={styles.pickerValue}>{activeCategory.label}</Text>
                                    ) : (
                                        <Text style={styles.pickerPlaceholder}>Select a category</Text>
                                    )}
                                </View>
                                <Text style={styles.pickerArrow}>{isCategoryOpen ? '▲' : '▼'}</Text>
                            </TouchableOpacity>

                            {isCategoryOpen && (
                                <>
                                    <View style={styles.categoryDivider} />
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <TouchableOpacity
                                            key={option.id}
                                            activeOpacity={0.85}
                                            style={styles.categoryOptionRow}
                                            onPress={() => {
                                                setSelectedCategory(option.id)
                                                setCategoryOpen(false)
                                            }}
                                        >
                                            <View style={styles.pickerIconBox}>
                                                <Image source={option.icon} style={styles.pickerIconImg} />
                                            </View>
                                            <Text style={styles.categoryOptionText}>{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}
                        </View>

                        {/* Find Service button */}
                        <TouchableOpacity
                            activeOpacity={canFindService ? 0.85 : 1}
                            style={[styles.findBtn, canFindService ? styles.findBtnActive : styles.findBtnDim]}
                            onPress={handleFindService}
                            disabled={!canFindService || isFindServiceLoading}
                        >
                            {isFindServiceLoading ? (
                                <ActivityIndicator color='#fff' size='small' />
                            ) : (
                                <Text style={styles.findBtnText}>Find Service</Text>
                            )}
                        </TouchableOpacity>
                    </View>
            </View>

            <Footer navigation={navigation} route={route} />

            {/* ── Location search modal ─────────────────────────────────────── */}
            <Modal
                visible={isLocationModalVisible}
                transparent
                animationType='slide'
                onRequestClose={closeLocationModal}
            >
                <View style={styles.modalBackdrop}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeLocationModal} />
                    <View style={styles.locationSheet}>
                        <View style={styles.dragHandle} />

                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Search Location</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={closeLocationModal}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search input */}
                        <View style={styles.searchInputWrap}>
                            <Image source={pointer} style={styles.searchInputIcon} />
                            <TextInput
                                style={styles.searchInputField}
                                placeholder='Search for a location...'
                                placeholderTextColor='#9AACBE'
                                value={locationSearchQuery}
                                onChangeText={handleLocationSearchChange}
                                autoFocus
                                returnKeyType='search'
                            />
                            {isSuggestionsLoading && (
                                <ActivityIndicator size='small' color='#0C5BC2' />
                            )}
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                            {/* Use current location */}
                            <TouchableOpacity
                                style={styles.useCurrentRow}
                                activeOpacity={0.85}
                                onPress={handleUseCurrentLocation}
                            >
                                <View style={styles.useCurrentIconWrap}>
                                    <Image source={pointer} style={styles.useCurrentIcon} />
                                </View>
                                <Text style={styles.useCurrentText}>
                                    {isLocationLoading ? 'Detecting location...' : 'Use my current location'}
                                </Text>
                            </TouchableOpacity>

                            {/* Suggestions */}
                            {locationSuggestions.length === 0 && locationSearchQuery.length >= 2 && !isSuggestionsLoading && (
                                <Text style={styles.noResultText}>No locations found. Try a different search.</Text>
                            )}
                            {locationSuggestions.map((suggestion) => (
                                <TouchableOpacity
                                    key={suggestion.place_id}
                                    style={styles.suggestionItem}
                                    activeOpacity={0.85}
                                    onPress={() => resolveAndSelectSuggestion(suggestion)}
                                >
                                    <View style={styles.suggestionIconWrap}>
                                        <Image source={pointer} style={styles.suggestionIcon} />
                                    </View>
                                    <Text style={styles.suggestionText} numberOfLines={2}>
                                        {suggestion.description}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ── Nearby workers modal ──────────────────────────────────────── */}
            <Modal
                visible={isWorkersModalVisible}
                transparent
                animationType='slide'
                onRequestClose={() => setWorkersModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setWorkersModalVisible(false)} />
                    <View style={styles.workersSheet}>
                        {/* Top bar */}
                        <View style={styles.workersSheetTopBar}>
                            <View style={styles.dragHandle} />
                            <View style={styles.workersSheetHeaderRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.workersSheetTitle}>
                                        Nearby {activeCategory?.label} Workers
                                    </Text>
                                    <View style={styles.workerCountBadge}>
                                        <Text style={styles.workerCountText}>{nearbyWorkers.length}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.closeBtn} onPress={() => setWorkersModalVisible(false)}>
                                    <Text style={styles.closeBtnText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.workersSubtitle}>
                                Tap a worker to select • Select multiple to send bulk request
                            </Text>
                        </View>

                        {/* Worker list */}
                        <ScrollView
                            contentContainerStyle={styles.workersListContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps='handled'
                        >
                            {nearbyWorkers.map((worker, index) => {
                                const isSelected = selectedWorkerIds.includes(worker.id)
                                const avatarSrc = AVATARS[index % AVATARS.length]
                                return (
                                    <TouchableOpacity
                                        key={worker.id}
                                        activeOpacity={0.88}
                                        style={[styles.workerCard, isSelected && styles.workerCardSelected]}
                                        onPress={() => handleToggleWorker(worker.id)}
                                    >
                                        <Image source={avatarSrc} style={styles.workerAvatar} />

                                        <View style={styles.workerInfo}>
                                            <Text style={styles.workerName}>{worker.name}</Text>
                                            <Text style={styles.workerExp}>
                                                {worker.experience} {worker.experience === 1 ? 'year' : 'years'} of experience
                                            </Text>
                                            <Text style={styles.workerRate}>
                                                ৳{worker.rate} / hour
                                            </Text>
                                            <Text style={styles.workerDist}>
                                                📍 {worker.distance} km from you
                                            </Text>
                                        </View>

                                        <View style={[styles.selectCircle, isSelected && styles.selectCircleActive]}>
                                            {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                            <View style={{ height: 8 }} />
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.workersFooter}>
                            <TouchableOpacity
                                activeOpacity={selectedWorkerIds.length > 0 ? 0.85 : 1}
                                style={[
                                    styles.sendBtn,
                                    selectedWorkerIds.length > 0 ? styles.sendBtnActive : styles.sendBtnDim
                                ]}
                                onPress={handleSendRequest}
                                disabled={selectedWorkerIds.length === 0}
                            >
                                <Text style={selectedWorkerIds.length > 0 ? styles.sendBtnTextActive : styles.sendBtnTextDim}>
                                    {selectedWorkerIds.length > 0
                                        ? `Send Request  (${selectedWorkerIds.length} selected)`
                                        : 'Select workers to continue'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default InstantHirePage
