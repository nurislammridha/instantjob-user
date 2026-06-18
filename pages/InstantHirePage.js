import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Animated,
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
import { io } from 'socket.io-client'
import { useFocusEffect } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'

import PrimaHeader from '../components/PrimaHeader'
import Footer from '../components/Footer'
import { socketUrl } from '../assets/functions/env'
import { SET_USER } from '../redux/_redux/Types'
import pointer from '../assets/icons/pointer.png'
import car from '../assets/icons/car.png'
import watch from '../assets/icons/watch.png'
import preferences from '../assets/icons/preferences.png'
import payment from '../assets/icons/payment.png'
import star from '../assets/icons/star.png'

const GOOGLE_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY'
const { height: screenHeight } = Dimensions.get('window')

const DEFAULT_REGION = {
    latitude: 23.6850,
    longitude: 90.3563,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5
}

const CATEGORY_OPTIONS = [
    { id: 'driver',      label: 'Driver',      icon: car },
    { id: 'cooker',      label: 'Cooker',      icon: watch },
    { id: 'maintenance', label: 'Maintenance', icon: preferences },
    { id: 'helper',      label: 'Helper',      icon: pointer },
    { id: 'mechanic',    label: 'Mechanic',    icon: payment },
    { id: 'cleaner',     label: 'Cleaner',     icon: star }
]

const FALLBACK_SUGGESTIONS = [
    { place_id: 'f1',  description: 'Gulshan, Dhaka',            lat: 23.7925, lng: 90.4078 },
    { place_id: 'f2',  description: 'Banani, Dhaka',             lat: 23.7935, lng: 90.4040 },
    { place_id: 'f3',  description: 'Dhanmondi, Dhaka',          lat: 23.7461, lng: 90.3742 },
    { place_id: 'f4',  description: 'Motijheel, Dhaka',          lat: 23.7297, lng: 90.4177 },
    { place_id: 'f5',  description: 'Mirpur, Dhaka',             lat: 23.8223, lng: 90.3654 },
    { place_id: 'f6',  description: 'Uttara, Dhaka',             lat: 23.8759, lng: 90.3795 },
    { place_id: 'f7',  description: 'Mohammadpur, Dhaka',        lat: 23.7643, lng: 90.3527 },
    { place_id: 'f8',  description: 'Narayanganj, Bangladesh',   lat: 23.6238, lng: 90.5000 },
    { place_id: 'f9',  description: 'Gazipur, Bangladesh',       lat: 23.9999, lng: 90.4203 },
    { place_id: 'f10', description: 'Manikganj, Bangladesh',     lat: 23.8624, lng: 89.8821 },
    { place_id: 'f11', description: 'Munshiganj, Bangladesh',    lat: 23.5422, lng: 90.5320 },
    { place_id: 'f12', description: 'Narsingdi, Bangladesh',     lat: 23.9217, lng: 90.7152 },
    { place_id: 'f13', description: 'Chittagong, Bangladesh',    lat: 22.3569, lng: 91.7832 },
    { place_id: 'f14', description: 'Sylhet, Bangladesh',        lat: 24.8949, lng: 91.8687 },
    { place_id: 'f15', description: 'Rajshahi, Bangladesh',      lat: 24.3745, lng: 88.6042 },
    { place_id: 'f16', description: 'Khulna, Bangladesh',        lat: 22.8456, lng: 89.5403 },
    { place_id: 'f17', description: 'Barisal, Bangladesh',       lat: 22.7010, lng: 90.3535 },
    { place_id: 'f18', description: 'Rangpur, Bangladesh',       lat: 25.7439, lng: 89.2752 },
    { place_id: 'f19', description: 'Mymensingh, Bangladesh',    lat: 24.7471, lng: 90.4203 },
    { place_id: 'f20', description: 'Comilla, Bangladesh',       lat: 23.4607, lng: 91.1809 },
]

// Job lifecycle states
const JOB_STATUS = {
    IDLE: 'idle',
    SEARCHING: 'searching',
    ACCEPTED: 'accepted',
    ARRIVED: 'arrived',
    WORKING: 'working',
    PAUSED: 'paused',
    COMPLETED: 'completed',
}

const InstantHirePage = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const reduxUser = useSelector((state) => state.auth.user)

    const mapRef = useRef(null)
    const mapReadyRef = useRef(false)
    const pendingCoordsRef = useRef(null)
    const searchDebounce = useRef(null)
    const socketRef = useRef(null)
    const locationIntervalRef = useRef(null)
    const activeRequestIdRef = useRef(null)

    // Radar animation
    const ring1Scale   = useRef(new Animated.Value(0.2)).current
    const ring1Opacity = useRef(new Animated.Value(0)).current
    const ring2Scale   = useRef(new Animated.Value(0.2)).current
    const ring2Opacity = useRef(new Animated.Value(0)).current
    const ring3Scale   = useRef(new Animated.Value(0.2)).current
    const ring3Opacity = useRef(new Animated.Value(0)).current
    const breatheAnim  = useRef(new Animated.Value(1)).current

    const [user, setUser] = useState(null)
    const [serviceLocation, setServiceLocation] = useState(DEFAULT_REGION)
    const [isLocationLoading, setLocationLoading] = useState(true)

    const [selectedLocationText, setSelectedLocationText] = useState(null)
    const [isLocationModalVisible, setLocationModalVisible] = useState(false)
    const [locationSearchQuery, setLocationSearchQuery]     = useState('')
    const [locationSuggestions, setLocationSuggestions]     = useState([])
    const [isSuggestionsLoading, setSuggestionsLoading]     = useState(false)

    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isCategoryOpen, setCategoryOpen]       = useState(false)

    const [dotPhase, setDotPhase] = useState(0)
    const [jobStatus, setJobStatus] = useState(JOB_STATUS.IDLE)

    // Vendor info after acceptance
    const [acceptedVendor, setAcceptedVendor] = useState(null)
    const [vendorLocation, setVendorLocation] = useState(null)
    const [currentRequestId, setCurrentRequestId] = useState(null)

    // Timer (synced from vendor events)
    const [workStartTime, setWorkStartTime] = useState(null)
    const [totalPausedSeconds, setTotalPausedSeconds] = useState(0)
    const [pausedAt, setPausedAt] = useState(null)
    const [displaySeconds, setDisplaySeconds] = useState(0)
    const timerRef = useRef(null)

    // Completed job price
    const [priceInfo, setPriceInfo] = useState(null)

    const activeCategory = useMemo(
        () => CATEGORY_OPTIONS.find((item) => item.id === selectedCategory),
        [selectedCategory]
    )

    const canFindService = selectedLocationText !== null && selectedCategory !== null && jobStatus === JOB_STATUS.IDLE

    // ── Load user from redux / storage ───────────────────────────────────

    useFocusEffect(
        useCallback(() => {
            if (reduxUser) {
                setUser(reduxUser)
            }
        }, [reduxUser])
    )

    // ── Radar animation ───────────────────────────────────────────────────

    useEffect(() => {
        const isSearching = jobStatus === JOB_STATUS.SEARCHING
        if (!isSearching) {
            ring1Scale.setValue(0.2); ring1Opacity.setValue(0)
            ring2Scale.setValue(0.2); ring2Opacity.setValue(0)
            ring3Scale.setValue(0.2); ring3Opacity.setValue(0)
            return
        }
        let active = true
        const runCycle = () => {
            if (!active) return
            ring1Scale.setValue(0.2); ring1Opacity.setValue(0.85)
            ring2Scale.setValue(0.2); ring2Opacity.setValue(0.85)
            ring3Scale.setValue(0.2); ring3Opacity.setValue(0.85)
            Animated.stagger(560, [
                Animated.parallel([
                    Animated.timing(ring1Scale,   { toValue: 1.55, duration: 1700, useNativeDriver: true }),
                    Animated.timing(ring1Opacity, { toValue: 0,    duration: 1700, useNativeDriver: true })
                ]),
                Animated.parallel([
                    Animated.timing(ring2Scale,   { toValue: 1.55, duration: 1700, useNativeDriver: true }),
                    Animated.timing(ring2Opacity, { toValue: 0,    duration: 1700, useNativeDriver: true })
                ]),
                Animated.parallel([
                    Animated.timing(ring3Scale,   { toValue: 1.55, duration: 1700, useNativeDriver: true }),
                    Animated.timing(ring3Opacity, { toValue: 0,    duration: 1700, useNativeDriver: true })
                ])
            ]).start(({ finished }) => { if (finished && active) runCycle() })
        }
        runCycle()
        return () => { active = false }
    }, [jobStatus])

    useEffect(() => {
        if (jobStatus !== JOB_STATUS.SEARCHING) return
        const timer = setInterval(() => setDotPhase(p => (p + 1) % 3), 420)
        return () => clearInterval(timer)
    }, [jobStatus])

    useEffect(() => {
        if (jobStatus !== JOB_STATUS.ACCEPTED) return
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(breatheAnim, { toValue: 0.2, duration: 650, useNativeDriver: true }),
                Animated.timing(breatheAnim, { toValue: 1,   duration: 650, useNativeDriver: true })
            ])
        )
        anim.start()
        return () => anim.stop()
    }, [jobStatus])

    // ── Timer (driven by socket events) ──────────────────────────────────

    const startLocalTimer = (startMs, alreadyPausedSecs) => {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startMs) / 1000) - alreadyPausedSecs
            setDisplaySeconds(Math.max(0, elapsed))
        }, 1000)
    }

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600)
        const m = Math.floor((secs % 3600) / 60)
        const s = secs % 60
        return h > 0
            ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    // ── Socket setup ──────────────────────────────────────────────────────

    useEffect(() => {
        const socket = io(socketUrl, { transports: ['websocket'], reconnection: true })
        socketRef.current = socket

        socket.on('connect', () => {
            console.log('User socket connected:', socket.id)
            if (reduxUser?._id) {
                socket.emit('joinRoom', reduxUser._id)
                socket.emit('user-online', { userId: reduxUser._id })
            }
        })

        // Vendor accepted our request
        socket.on('vendor-found', (data) => {
            setJobStatus(JOB_STATUS.ACCEPTED)
            setAcceptedVendor(data)
            setVendorLocation({ latitude: data.lat, longitude: data.lng })
            if (data.lat && data.lng) {
                mapRef.current?.animateToRegion({
                    latitude: data.lat,
                    longitude: data.lng,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }, 800)
            }
        })

        // No vendors found nearby
        socket.on('no-vendors-found', () => {
            setJobStatus(JOB_STATUS.IDLE)
            Alert.alert(
                'No Vendors Found',
                'No available vendors in your area for this category within 5 km. Please try again later.'
            )
        })

        // Vendor live location update
        socket.on('vendor-location-update', (data) => {
            setVendorLocation({ latitude: data.lat, longitude: data.lng })
        })

        // Vendor arrived
        socket.on('vendor-arrived', () => {
            setJobStatus(JOB_STATUS.ARRIVED)
        })

        // Work started
        socket.on('job-started', (data) => {
            const startMs = data.startTime
            setWorkStartTime(startMs)
            setTotalPausedSeconds(0)
            setPausedAt(null)
            setDisplaySeconds(0)
            setJobStatus(JOB_STATUS.WORKING)
            startLocalTimer(startMs, 0)
        })

        // Work paused
        socket.on('job-paused', (data) => {
            if (timerRef.current) clearInterval(timerRef.current)
            setPausedAt(data.pausedAt)
            setTotalPausedSeconds(data.totalPausedSeconds)
            setJobStatus(JOB_STATUS.PAUSED)
        })

        // Work resumed
        socket.on('job-resumed', (data) => {
            setTotalPausedSeconds(data.totalPausedSeconds)
            setPausedAt(null)
            setJobStatus(JOB_STATUS.WORKING)
            // Recalculate timer: elapsed = (now - startTime) - totalPausedSeconds
            startLocalTimer(workStartTime, data.totalPausedSeconds)
        })

        // Work completed
        socket.on('job-completed', (data) => {
            if (timerRef.current) clearInterval(timerRef.current)
            setDisplaySeconds(data.totalSeconds)
            setPriceInfo(data)
            setJobStatus(JOB_STATUS.COMPLETED)
            stopLocationInterval()
        })

        // Job cancelled by vendor
        socket.on('job-cancelled-by-user', () => {
            Alert.alert('Job Cancelled', 'The vendor cancelled the job.')
            resetJob()
        })

        socket.on('disconnect', () => {
            console.log('User socket disconnected')
        })

        return () => {
            socket.emit('user-offline', { userId: reduxUser?._id })
            socket.disconnect()
            stopLocationInterval()
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    // Re-join room when user is available
    useEffect(() => {
        if (user?._id && socketRef.current?.connected) {
            socketRef.current.emit('joinRoom', user._id)
            socketRef.current.emit('user-online', { userId: user._id })
        }
    }, [user])

    // Keep workStartTime ref accessible in socket handlers
    useEffect(() => {
        // workStartTime changes when job starts — reconnect resumed handler
        const socket = socketRef.current
        if (!socket) return
        socket.off('job-resumed')
        socket.on('job-resumed', (data) => {
            setTotalPausedSeconds(data.totalPausedSeconds)
            setPausedAt(null)
            setJobStatus(JOB_STATUS.WORKING)
            startLocalTimer(workStartTime, data.totalPausedSeconds)
        })
    }, [workStartTime])

    // ── Location interval (send user's live location to vendor) ──────────

    const startLocationInterval = (requestId) => {
        if (locationIntervalRef.current) return
        locationIntervalRef.current = setInterval(() => {
            Geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    if (socketRef.current && user?._id) {
                        socketRef.current.emit('user-location-update', {
                            requestId,
                            userId: user._id,
                            lat: latitude,
                            lng: longitude,
                        })
                    }
                },
                () => {},
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
            )
        }, 3000)
    }

    const stopLocationInterval = () => {
        if (locationIntervalRef.current) {
            clearInterval(locationIntervalRef.current)
            locationIntervalRef.current = null
        }
    }

    // ── Location helpers ──────────────────────────────────────────────────

    const onMapReady = () => {
        mapReadyRef.current = true
        if (pendingCoordsRef.current) {
            mapRef.current?.animateToRegion(pendingCoordsRef.current, 600)
            pendingCoordsRef.current = null
        }
    }

    const updateMapRegion = (coords, animate = true) => {
        const region = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: DEFAULT_REGION.latitudeDelta,
            longitudeDelta: DEFAULT_REGION.longitudeDelta
        }
        setServiceLocation(region)
        if (!animate) return
        if (mapReadyRef.current && mapRef.current) {
            mapRef.current.animateToRegion(region, 600)
        } else {
            pendingCoordsRef.current = region
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

    const reverseGeocode = async (latitude, longitude) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en&zoom=16`
            const res = await fetch(url, { headers: { 'User-Agent': 'InstantJobApp/1.0', Accept: 'application/json' } })
            const data = await res.json()
            if (data && data.address) {
                const a = data.address
                const neighbourhood = a.suburb || a.neighbourhood || a.village || a.hamlet || a.quarter
                const city = a.city || a.town || a.municipality || a.county
                const parts = [neighbourhood, city].filter(Boolean)
                return parts.length > 0 ? parts.join(', ') : (data.display_name || '').split(',').slice(0, 2).join(',').trim()
            }
        } catch (_) {}
        return 'My Current Location'
    }

    const fetchCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission()
        if (!hasPermission) { setLocationLoading(false); return }

        const onSuccess = async (position) => {
            const { latitude, longitude } = position.coords
            updateMapRegion({ latitude, longitude })
            const placeName = await reverseGeocode(latitude, longitude)
            setSelectedLocationText(placeName)
            setLocationLoading(false)
        }

        const onFinalError = () => {
            setSelectedLocationText('My Current Location')
            setLocationLoading(false)
        }

        Geolocation.getCurrentPosition(
            onSuccess,
            () => Geolocation.getCurrentPosition(
                onSuccess,
                onFinalError,
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
            ),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    useEffect(() => {
        if (Platform.OS === 'android') {
            Geolocation.setRNConfiguration({
                skipPermissionRequests: false,
                authorizationLevel: 'whenInUse',
                locationProvider: 'auto'
            })
        }
        fetchCurrentLocation()
    }, [])

    // ── Location search ───────────────────────────────────────────────────

    const fetchSuggestions = async (query) => {
        if (!query || query.trim().length < 2) { setLocationSuggestions([]); return }
        setSuggestionsLoading(true)
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

    const resolveAndSelectSuggestion = (suggestion) => {
        if (suggestion.lat && suggestion.lng) {
            updateMapRegion({ latitude: suggestion.lat, longitude: suggestion.lng })
        }
        setSelectedLocationText(suggestion.description)
        closeLocationModal()
    }

    const handleUseCurrentLocation = () => {
        closeLocationModal()
        setLocationLoading(true)
        fetchCurrentLocation()
    }

    const closeLocationModal = () => {
        setLocationModalVisible(false)
        setLocationSearchQuery('')
        setLocationSuggestions([])
    }

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

    // ── Find service (real socket request) ───────────────────────────────

    const handleFindService = () => {
        if (!canFindService) return
        if (!socketRef.current?.connected) {
            Alert.alert('Connection Error', 'Not connected to server. Please check your internet.')
            return
        }
        const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        setCurrentRequestId(requestId)
        activeRequestIdRef.current = requestId
        setJobStatus(JOB_STATUS.SEARCHING)

        socketRef.current.emit('job-request', {
            requestId,
            userId: user?._id || 'anonymous',
            lat: serviceLocation.latitude,
            lng: serviceLocation.longitude,
            categoryName: activeCategory?.label || '',
            userName: user?.name || 'User',
            userAvatar: user?.avatar?.url || null,
            address: selectedLocationText || '',
        })

        // Start sending user location updates
        startLocationInterval(requestId)
    }

    const handleCancelSearch = () => {
        if (activeRequestIdRef.current && socketRef.current) {
            socketRef.current.emit('cancel-job-request', {
                requestId: activeRequestIdRef.current,
                userId: user?._id,
            })
        }
        stopLocationInterval()
        setJobStatus(JOB_STATUS.IDLE)
        setCurrentRequestId(null)
        activeRequestIdRef.current = null
    }

    const handleCancelJob = () => {
        Alert.alert(
            'Cancel Job?',
            'Are you sure you want to cancel this job?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                        if (activeRequestIdRef.current && socketRef.current) {
                            socketRef.current.emit('cancel-job-request', {
                                requestId: activeRequestIdRef.current,
                                userId: user?._id,
                            })
                        }
                        resetJob()
                    }
                }
            ]
        )
    }

    const resetJob = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        stopLocationInterval()
        setJobStatus(JOB_STATUS.IDLE)
        setAcceptedVendor(null)
        setVendorLocation(null)
        setCurrentRequestId(null)
        activeRequestIdRef.current = null
        setWorkStartTime(null)
        setTotalPausedSeconds(0)
        setPausedAt(null)
        setDisplaySeconds(0)
        setPriceInfo(null)
    }

    // ── Render ────────────────────────────────────────────────────────────

    const isSearching = jobStatus === JOB_STATUS.SEARCHING
    const isAccepted = jobStatus === JOB_STATUS.ACCEPTED
    const isArrived = jobStatus === JOB_STATUS.ARRIVED
    const isWorking = jobStatus === JOB_STATUS.WORKING || jobStatus === JOB_STATUS.PAUSED
    const isCompleted = jobStatus === JOB_STATUS.COMPLETED
    const showPanel = jobStatus === JOB_STATUS.IDLE

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
                    initialRegion={DEFAULT_REGION}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    onMapReady={onMapReady}
                    onPress={jobStatus === JOB_STATUS.IDLE ? handleMapPress : undefined}
                >
                    {jobStatus === JOB_STATUS.IDLE && (
                        <Marker
                            coordinate={serviceLocation}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                            title='Service location'
                        />
                    )}
                    {vendorLocation && (
                        <Marker
                            coordinate={vendorLocation}
                            title={acceptedVendor?.name || 'Vendor'}
                            description={acceptedVendor?.categoryName}
                            pinColor='#16A34A'
                        />
                    )}
                </MapView>

                {/* Bottom panel — only when idle */}
                {showPanel && (
                    <View style={styles.panel}>
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
                                    {isLocationLoading ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <ActivityIndicator size='small' color='#0C5BC2' style={{ marginRight: 7 }} />
                                            <Text style={styles.pickerPlaceholder}>Detecting your location...</Text>
                                        </View>
                                    ) : selectedLocationText ? (
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

                        <View style={styles.pickerBox}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.pickerRow}
                                onPress={() => setCategoryOpen(!isCategoryOpen)}
                            >
                                <View style={[styles.pickerIconBox, !activeCategory && { backgroundColor: '#F0F4FA' }]}>
                                    {activeCategory
                                        ? <Image source={activeCategory.icon} style={styles.pickerIconImg} />
                                        : <Text style={{ fontSize: 16, color: '#A0B0C8' }}>☰</Text>
                                    }
                                </View>
                                <View style={styles.pickerMeta}>
                                    <Text style={styles.pickerLabel}>SERVICE CATEGORY</Text>
                                    {activeCategory
                                        ? <Text style={styles.pickerValue}>{activeCategory.label}</Text>
                                        : <Text style={styles.pickerPlaceholder}>Select a category</Text>
                                    }
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
                                            onPress={() => { setSelectedCategory(option.id); setCategoryOpen(false) }}
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

                        <TouchableOpacity
                            activeOpacity={canFindService ? 0.85 : 1}
                            style={[styles.findBtn, canFindService ? styles.findBtnActive : styles.findBtnDim]}
                            onPress={handleFindService}
                            disabled={!canFindService}
                        >
                            <Text style={styles.findBtnText}>Find Service</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Vendor accepted card */}
                {(isAccepted || isArrived) && acceptedVendor && (
                    <View style={styles.vendorBottomCard}>
                        {isArrived && (
                            <View style={styles.arrivedBanner}>
                                <Text style={styles.arrivedBannerText}>Vendor has arrived at your location!</Text>
                            </View>
                        )}
                        <View style={styles.vendorCardRow}>
                            <View style={styles.vendorAvatarWrap}>
                                {acceptedVendor.avatar ? (
                                    <Image source={{ uri: acceptedVendor.avatar }} style={styles.vendorAvatarLg} />
                                ) : (
                                    <View style={[styles.vendorAvatarLg, { alignItems: 'center', justifyContent: 'center' }]}>
                                        <Text style={{ fontSize: 28 }}>👷</Text>
                                    </View>
                                )}
                                <View style={styles.vendorOnlineDot} />
                            </View>
                            <View style={styles.vendorInfo}>
                                <Text style={styles.vendorNameLg}>{acceptedVendor.name}</Text>
                                <View style={styles.vendorCatBadge}>
                                    <Text style={styles.vendorCatText}>{(acceptedVendor.categoryName || '').toUpperCase()}</Text>
                                </View>
                                <Text style={styles.ratingStars}>
                                    {'★'.repeat(Math.round(acceptedVendor.rating || 5))} {acceptedVendor.rating || 5}
                                    <Text style={styles.ratingCount}> · {acceptedVendor.distance} km away</Text>
                                </Text>
                            </View>
                        </View>

                        {isAccepted && (
                            <View style={styles.onWayBanner}>
                                <Animated.View style={[styles.onWayDot, { opacity: breatheAnim }]} />
                                <Text style={styles.onWayText}>On the way to your location</Text>
                            </View>
                        )}

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statEmoji}>🎓</Text>
                                <Text style={styles.statValue}>{acceptedVendor.experience} yrs</Text>
                                <Text style={styles.statLabel}>Experience</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statEmoji}>💰</Text>
                                <Text style={styles.statValue}>৳{acceptedVendor.pricePerHour}</Text>
                                <Text style={styles.statLabel}>Per Hour</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statEmoji}>📍</Text>
                                <Text style={styles.statValue}>{acceptedVendor.distance} km</Text>
                                <Text style={styles.statLabel}>Distance</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statEmoji}>⭐</Text>
                                <Text style={styles.statValue}>{acceptedVendor.rating || 5}</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.cancelJobBtn} onPress={handleCancelJob}>
                            <Text style={styles.cancelJobBtnText}>Cancel Job</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Working / Paused card */}
                {isWorking && acceptedVendor && (
                    <View style={styles.vendorBottomCard}>
                        <View style={styles.workingHeader}>
                            <Text style={styles.workingTitle}>Work in Progress</Text>
                            <View style={[styles.statusBadge, jobStatus === JOB_STATUS.PAUSED
                                ? { backgroundColor: '#FEF9C3' }
                                : { backgroundColor: '#DCFCE7' }
                            ]}>
                                <Text style={[styles.statusBadgeText, jobStatus === JOB_STATUS.PAUSED
                                    ? { color: '#854D0E' }
                                    : { color: '#15803D' }
                                ]}>
                                    {jobStatus === JOB_STATUS.PAUSED ? '⏸ Paused' : '● Working'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.timerDisplay}>{formatTime(displaySeconds)}</Text>
                        <Text style={styles.timerRate}>
                            ৳{acceptedVendor.pricePerHour}/hr ·{' '}
                            Running total: ৳{((acceptedVendor.pricePerHour / 3600) * displaySeconds).toFixed(2)}
                        </Text>
                        <Text style={styles.workingVendorName}>
                            {acceptedVendor.name} is working on your request
                        </Text>
                    </View>
                )}

                {/* Completed price card */}
                {isCompleted && priceInfo && (
                    <View style={styles.vendorBottomCard}>
                        <View style={styles.completedHeader}>
                            <View style={styles.completedCheckCircle}>
                                <Text style={styles.completedCheck}>✓</Text>
                            </View>
                            <Text style={styles.completedTitle}>Work Completed!</Text>
                        </View>
                        <View style={styles.priceBreakdown}>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceRowLabel}>Work Duration</Text>
                                <Text style={styles.priceRowValue}>{formatTime(priceInfo.totalSeconds)}</Text>
                            </View>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceRowLabel}>Rate per hour</Text>
                                <Text style={styles.priceRowValue}>৳{priceInfo.pricePerHour}</Text>
                            </View>
                            <View style={[styles.priceRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.priceTotalLabel}>Total Amount</Text>
                                <Text style={styles.priceTotalValue}>৳{priceInfo.totalAmount}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.paymentBtn} onPress={() => {
                            Alert.alert('Payment', 'Payment gateway coming soon!')
                        }}>
                            <Text style={styles.paymentBtnText}>Proceed to Payment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.doneLinkBtn} onPress={resetJob}>
                            <Text style={styles.doneLinkBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Footer navigation={navigation} route={route} />

            {/* ── Location search modal ─────────────────────────────────── */}
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
                            {isSuggestionsLoading && <ActivityIndicator size='small' color='#0C5BC2' />}
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
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

            {/* ── Searching modal (radar) ───────────────────────────────── */}
            <Modal visible={isSearching} transparent animationType='fade' onRequestClose={() => {}}>
                <View style={styles.searchingOverlay}>
                    <View style={styles.searchingCard}>
                        <View style={styles.radarContainer}>
                            <Animated.View style={[styles.radarRing, { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] }]} />
                            <Animated.View style={[styles.radarRing, { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] }]} />
                            <Animated.View style={[styles.radarRing, { opacity: ring3Opacity, transform: [{ scale: ring3Scale }] }]} />
                            <View style={styles.radarCenter}>
                                {activeCategory && <Image source={activeCategory.icon} style={styles.radarCenterIcon} />}
                            </View>
                        </View>
                        <Text style={styles.searchingTitle}>Searching Nearby Workers</Text>
                        <Text style={styles.searchingSubtitle}>
                            {'Finding ' + (activeCategory?.label ?? '') + ' experts\nnear your selected location...'}
                        </Text>
                        <View style={styles.dotsRow}>
                            {[0, 1, 2].map((i) => (
                                <View
                                    key={i}
                                    style={{
                                        width: 9, height: 9, borderRadius: 4.5, marginHorizontal: 4,
                                        backgroundColor: dotPhase === i ? '#0C5BC2' : '#D4E3F5'
                                    }}
                                />
                            ))}
                        </View>
                        <TouchableOpacity style={styles.cancelSearchBtn} onPress={handleCancelSearch}>
                            <Text style={styles.cancelSearchBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FB' },
    body: { flex: 1 },

    panel: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: 16, paddingBottom: 22,
        shadowColor: '#0D1A2D',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.1, shadowRadius: 18, elevation: 12
    },

    pickerBox: {
        borderWidth: 1, borderColor: '#D7E3F3', borderRadius: 12,
        backgroundColor: '#FAFCFF', marginBottom: 10, overflow: 'hidden'
    },
    pickerRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 11, minHeight: 58
    },
    pickerIconBox: {
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center', marginRight: 11
    },
    pickerIconImg: { width: 15, height: 15, tintColor: '#1D5FC8', resizeMode: 'contain' },
    pickerMeta: { flex: 1, marginRight: 4 },
    pickerLabel: { fontSize: 10, fontWeight: '500', color: '#8BA3C0', letterSpacing: 0.3, marginBottom: 2 },
    pickerValue: { fontSize: 14, fontWeight: '600', color: '#1F2E44' },
    pickerPlaceholder: { fontSize: 13, fontWeight: '400', color: '#B0C2D8' },
    pickerArrow: { fontSize: 10, color: '#6B87A8' },
    categoryDivider: { height: 1, backgroundColor: '#EEF3FA' },
    categoryOptionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11 },
    categoryOptionText: { fontSize: 14, fontWeight: '500', color: '#233A5B', marginLeft: 10 },

    findBtn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    findBtnActive: { backgroundColor: '#0C5BC2' },
    findBtnDim: { backgroundColor: '#C2D4EF' },
    findBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

    // Vendor card (accepted / arrived)
    vendorBottomCard: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 28,
        shadowColor: '#0D1A2D',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12, shadowRadius: 18, elevation: 14,
    },
    arrivedBanner: {
        backgroundColor: '#DCFCE7', borderRadius: 10, paddingVertical: 10,
        paddingHorizontal: 14, marginBottom: 12, alignItems: 'center',
    },
    arrivedBannerText: { fontSize: 14, fontWeight: '700', color: '#15803D' },
    vendorCardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    vendorAvatarWrap: { position: 'relative', marginRight: 14 },
    vendorAvatarLg: {
        width: 68, height: 68, borderRadius: 34,
        backgroundColor: '#D9E8F9', borderWidth: 3, borderColor: '#fff', elevation: 4
    },
    vendorOnlineDot: {
        position: 'absolute', bottom: 1, right: 1,
        width: 16, height: 16, borderRadius: 8,
        backgroundColor: '#16A34A', borderWidth: 2.5, borderColor: '#fff'
    },
    vendorInfo: { flex: 1 },
    vendorNameLg: { fontSize: 17, fontWeight: '800', color: '#1A2C45', marginBottom: 4 },
    vendorCatBadge: {
        alignSelf: 'flex-start', backgroundColor: '#EBF3FF',
        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4
    },
    vendorCatText: { fontSize: 10, fontWeight: '700', color: '#0C5BC2', letterSpacing: 0.4 },
    ratingStars: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },
    ratingCount: { fontSize: 12, fontWeight: '400', color: '#8BA3C0' },

    onWayBanner: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    onWayDot: { width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#16A34A', marginRight: 8 },
    onWayText: { fontSize: 13, fontWeight: '600', color: '#15803D' },

    statsRow: { flexDirection: 'row', marginBottom: 12 },
    statBox: {
        flex: 1, backgroundColor: '#F7FAFF', borderRadius: 10,
        paddingVertical: 10, alignItems: 'center',
        borderWidth: 1, borderColor: '#E4EFF9', marginHorizontal: 2
    },
    statEmoji: { fontSize: 14, marginBottom: 3 },
    statValue: { fontSize: 13, fontWeight: '800', color: '#1A2C45' },
    statLabel: { fontSize: 9, fontWeight: '500', color: '#8BA3C0', marginTop: 1 },

    cancelJobBtn: {
        height: 46, borderRadius: 12,
        backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#FECACA',
    },
    cancelJobBtnText: { fontSize: 15, fontWeight: '600', color: '#DC2626' },

    // Working card
    workingHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6
    },
    workingTitle: { fontSize: 17, fontWeight: '800', color: '#1A2C45' },
    statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
    statusBadgeText: { fontSize: 12, fontWeight: '700' },
    timerDisplay: {
        fontSize: 46, fontWeight: '800', color: '#1A2C45',
        textAlign: 'center', letterSpacing: 2, marginVertical: 4
    },
    timerRate: { fontSize: 13, color: '#607089', textAlign: 'center', marginBottom: 6 },
    workingVendorName: { fontSize: 13, color: '#607089', textAlign: 'center' },

    // Completed price
    completedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    completedCheckCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginRight: 12
    },
    completedCheck: { fontSize: 22, color: '#15803D' },
    completedTitle: { fontSize: 20, fontWeight: '800', color: '#1A2C45' },
    priceBreakdown: { backgroundColor: '#F4F7FB', borderRadius: 12, padding: 14, marginBottom: 14 },
    priceRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#E3EAF4'
    },
    priceRowLabel: { fontSize: 14, color: '#607089' },
    priceRowValue: { fontSize: 14, fontWeight: '600', color: '#1A2C45' },
    priceTotalLabel: { fontSize: 16, fontWeight: '700', color: '#1A2C45' },
    priceTotalValue: { fontSize: 22, fontWeight: '800', color: '#0C5BC2' },
    paymentBtn: {
        height: 52, borderRadius: 14, backgroundColor: '#0C5BC2',
        alignItems: 'center', justifyContent: 'center', marginBottom: 10
    },
    paymentBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    doneLinkBtn: { alignItems: 'center', paddingVertical: 8 },
    doneLinkBtnText: { fontSize: 14, color: '#607089', fontWeight: '600' },

    // Modals
    modalBackdrop: {
        flex: 1, backgroundColor: 'rgba(10, 20, 38, 0.52)', justifyContent: 'flex-end'
    },
    dragHandle: {
        width: 38, height: 4, borderRadius: 2,
        backgroundColor: '#D4E0F0', alignSelf: 'center', marginTop: 10, marginBottom: 12
    },
    sheetHeader: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14, paddingHorizontal: 2
    },
    sheetTitle: { fontSize: 17, fontWeight: '700', color: '#1A2C45' },
    closeBtn: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#F0F5FA', alignItems: 'center', justifyContent: 'center'
    },
    closeBtnText: { fontSize: 15, color: '#5F7592', fontWeight: '600', lineHeight: 20 },
    locationSheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingHorizontal: 16, paddingBottom: 28, maxHeight: screenHeight * 0.74
    },
    searchInputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F2F6FC', borderRadius: 12, paddingHorizontal: 12,
        borderWidth: 1, borderColor: '#DCE8F6', marginBottom: 10
    },
    searchInputIcon: { width: 15, height: 15, tintColor: '#7A8EA8', resizeMode: 'contain', marginRight: 8 },
    searchInputField: { flex: 1, height: 44, fontSize: 14, color: '#1F2E44' },
    useCurrentRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF3FA', marginBottom: 4
    },
    useCurrentIconWrap: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: '#EBF3FF', alignItems: 'center', justifyContent: 'center', marginRight: 10
    },
    useCurrentIcon: { width: 13, height: 13, tintColor: '#0C5BC2', resizeMode: 'contain' },
    useCurrentText: { fontSize: 14, fontWeight: '600', color: '#0C5BC2' },
    suggestionItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0F5FB'
    },
    suggestionIconWrap: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: '#F0F5FA', alignItems: 'center', justifyContent: 'center', marginRight: 10
    },
    suggestionIcon: { width: 13, height: 13, tintColor: '#4B6A8B', resizeMode: 'contain' },
    suggestionText: { flex: 1, fontSize: 13, color: '#2D4465', lineHeight: 18 },
    noResultText: { fontSize: 13, color: '#8BA3C0', textAlign: 'center', paddingVertical: 20 },

    // Searching modal
    searchingOverlay: {
        flex: 1, backgroundColor: 'rgba(8, 18, 36, 0.82)',
        alignItems: 'center', justifyContent: 'center'
    },
    searchingCard: {
        backgroundColor: '#fff', borderRadius: 24,
        paddingHorizontal: 32, paddingTop: 36, paddingBottom: 32,
        alignItems: 'center', width: '80%',
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25, shadowRadius: 28, elevation: 20
    },
    radarContainer: { width: 116, height: 116, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
    radarRing: {
        position: 'absolute', width: 116, height: 116, borderRadius: 58,
        borderWidth: 1.5, borderColor: '#0C5BC2'
    },
    radarCenter: {
        width: 54, height: 54, borderRadius: 27,
        backgroundColor: '#0C5BC2', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#0C5BC2', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 10, elevation: 8
    },
    radarCenterIcon: { width: 24, height: 24, tintColor: '#fff', resizeMode: 'contain' },
    searchingTitle: { fontSize: 18, fontWeight: '800', color: '#1A2C45', marginBottom: 6, textAlign: 'center' },
    searchingSubtitle: { fontSize: 13, color: '#6B87A8', textAlign: 'center', lineHeight: 20, marginBottom: 22 },
    dotsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    cancelSearchBtn: {
        marginTop: 4, paddingVertical: 10, paddingHorizontal: 28,
        borderRadius: 10, borderWidth: 1, borderColor: '#C2D4EF'
    },
    cancelSearchBtnText: { fontSize: 14, fontWeight: '600', color: '#5F7592' },
})

export default InstantHirePage
