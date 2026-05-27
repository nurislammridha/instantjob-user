import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
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
import { useFocusEffect } from '@react-navigation/native'

import PrimaHeader from '../components/PrimaHeader'
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

const GOOGLE_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY'  // ← paste your AIzaSy… key here
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
    // Dhaka division
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
    { place_id: 'f13', description: 'Faridpur, Bangladesh',      lat: 23.6070, lng: 89.8384 },
    { place_id: 'f14', description: 'Gopalganj, Bangladesh',     lat: 23.0048, lng: 89.8267 },
    { place_id: 'f15', description: 'Madaripur, Bangladesh',     lat: 23.1641, lng: 90.1997 },
    { place_id: 'f16', description: 'Shariatpur, Bangladesh',    lat: 23.2424, lng: 90.4348 },
    // Khulna division (+ Bagerhat)
    { place_id: 'f17', description: 'Bagerhat, Bangladesh',            lat: 22.6585, lng: 89.7855 },
    { place_id: 'f18', description: 'Bagerhat Sadar, Bagerhat',        lat: 22.6541, lng: 89.7960 },
    { place_id: 'f19', description: 'Mongla, Bagerhat',                lat: 22.4833, lng: 89.5833 },
    { place_id: 'f20', description: 'Morrelganj, Bagerhat',            lat: 22.6500, lng: 89.8417 },
    { place_id: 'f21', description: 'Rampal, Bagerhat',                lat: 22.6929, lng: 89.7058 },
    { place_id: 'f22', description: 'Kachua, Bagerhat',                lat: 22.8167, lng: 89.7333 },
    { place_id: 'f23', description: 'Fakirhat, Bagerhat',              lat: 22.9000, lng: 89.7833 },
    { place_id: 'f24', description: 'Sharankhola, Bagerhat',           lat: 22.4833, lng: 89.9000 },
    { place_id: 'f25', description: 'Khulna, Bangladesh',              lat: 22.8456, lng: 89.5403 },
    { place_id: 'f26', description: 'Sonadanga, Khulna',               lat: 22.8323, lng: 89.5500 },
    { place_id: 'f27', description: 'Jessore, Bangladesh',             lat: 23.1664, lng: 89.2142 },
    { place_id: 'f28', description: 'Satkhira, Bangladesh',            lat: 22.7185, lng: 89.0705 },
    { place_id: 'f29', description: 'Narail, Bangladesh',              lat: 23.1728, lng: 89.5007 },
    { place_id: 'f30', description: 'Kushtia, Bangladesh',             lat: 23.9014, lng: 89.1224 },
    // Barishal division
    { place_id: 'f31', description: 'Barisal, Bangladesh',             lat: 22.7010, lng: 90.3535 },
    { place_id: 'f32', description: 'Patuakhali, Bangladesh',          lat: 22.3596, lng: 90.3298 },
    { place_id: 'f33', description: 'Bhola, Bangladesh',               lat: 22.6859, lng: 90.6482 },
    { place_id: 'f34', description: 'Pirojpur, Bangladesh',            lat: 22.5789, lng: 89.9756 },
    // Chittagong division
    { place_id: 'f35', description: 'Chittagong, Bangladesh',          lat: 22.3569, lng: 91.7832 },
    { place_id: 'f36', description: 'Cox\'s Bazar, Bangladesh',        lat: 21.4272, lng: 92.0058 },
    { place_id: 'f37', description: 'Comilla, Bangladesh',             lat: 23.4607, lng: 91.1809 },
    { place_id: 'f38', description: 'Feni, Bangladesh',                lat: 23.0231, lng: 91.3977 },
    { place_id: 'f39', description: 'Noakhali, Bangladesh',            lat: 22.8696, lng: 91.0993 },
    { place_id: 'f40', description: 'Chandpur, Bangladesh',            lat: 23.2513, lng: 90.6512 },
    // Sylhet division
    { place_id: 'f41', description: 'Sylhet, Bangladesh',              lat: 24.8949, lng: 91.8687 },
    { place_id: 'f42', description: 'Moulvibazar, Bangladesh',         lat: 24.4826, lng: 91.7774 },
    { place_id: 'f43', description: 'Habiganj, Bangladesh',            lat: 24.3745, lng: 91.4155 },
    { place_id: 'f44', description: 'Sunamganj, Bangladesh',           lat: 25.0658, lng: 91.3950 },
    // Rajshahi division
    { place_id: 'f45', description: 'Rajshahi, Bangladesh',            lat: 24.3745, lng: 88.6042 },
    { place_id: 'f46', description: 'Bogra, Bangladesh',               lat: 24.8510, lng: 89.3696 },
    { place_id: 'f47', description: 'Pabna, Bangladesh',               lat: 24.0064, lng: 89.2372 },
    { place_id: 'f48', description: 'Sirajganj, Bangladesh',           lat: 24.4536, lng: 89.7067 },
    { place_id: 'f49', description: 'Naogaon, Bangladesh',             lat: 24.8030, lng: 88.9349 },
    // Rangpur division
    { place_id: 'f50', description: 'Rangpur, Bangladesh',             lat: 25.7439, lng: 89.2752 },
    { place_id: 'f51', description: 'Dinajpur, Bangladesh',            lat: 25.6277, lng: 88.6336 },
    { place_id: 'f52', description: 'Gaibandha, Bangladesh',           lat: 25.3284, lng: 89.5285 },
    { place_id: 'f53', description: 'Kurigram, Bangladesh',            lat: 25.8074, lng: 89.6369 },
    // Mymensingh division
    { place_id: 'f54', description: 'Mymensingh, Bangladesh',          lat: 24.7471, lng: 90.4203 },
    { place_id: 'f55', description: 'Kishoreganj, Bangladesh',         lat: 24.4449, lng: 90.7766 },
    { place_id: 'f56', description: 'Netrokona, Bangladesh',           lat: 24.8703, lng: 90.7270 },
    { place_id: 'f57', description: 'Tangail, Bangladesh',             lat: 24.2513, lng: 89.9167 },
]

// One "accepted" worker per category shown after fake search
const ACCEPTED_WORKERS = {
    driver:      { name: 'Rafiqul Islam',  experience: 7, rate: 450, distance: 1.2, rating: 4.7, eta: 9,  avatar: avatar1 },
    cooker:      { name: 'Rina Begum',     experience: 6, rate: 350, distance: 0.8, rating: 4.9, eta: 7,  avatar: avatar2 },
    maintenance: { name: 'Anwar Hossain',  experience: 9, rate: 550, distance: 1.1, rating: 4.8, eta: 8,  avatar: avatar3 },
    helper:      { name: 'Sumon Mia',      experience: 2, rate: 250, distance: 0.6, rating: 4.5, eta: 5,  avatar: avatar4 },
    mechanic:    { name: 'Habibur Rahman', experience: 8, rate: 600, distance: 1.5, rating: 4.9, eta: 12, avatar: avatar5 },
    cleaner:     { name: 'Kohinoor Begum', experience: 3, rate: 280, distance: 0.9, rating: 4.6, eta: 7,  avatar: avatar1 },
}

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

    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(10, 20, 38, 0.52)',
        justifyContent: 'flex-end'
    },

    dragHandle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D4E0F0',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 12
    },

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
    searchInputIcon: { width: 15, height: 15, tintColor: '#7A8EA8', resizeMode: 'contain', marginRight: 8 },
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
    suggestionText: { flex: 1, fontSize: 13, color: '#2D4465', lineHeight: 18 },
    noResultText: { fontSize: 13, color: '#8BA3C0', textAlign: 'center', paddingVertical: 20 },

    // ── Searching overlay ─────────────────────────────────────────────────
    searchingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(8, 18, 36, 0.82)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchingCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 32,
        paddingTop: 36,
        paddingBottom: 32,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#0D1A2D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 28,
        elevation: 20
    },
    radarContainer: {
        width: 116,
        height: 116,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 26
    },
    radarRing: {
        position: 'absolute',
        width: 116,
        height: 116,
        borderRadius: 58,
        borderWidth: 1.5,
        borderColor: '#0C5BC2'
    },
    radarCenter: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#0C5BC2',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0C5BC2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8
    },
    radarCenterIcon: { width: 24, height: 24, tintColor: '#fff', resizeMode: 'contain' },
    searchingTitle: { fontSize: 18, fontWeight: '800', color: '#1A2C45', marginBottom: 6, textAlign: 'center' },
    searchingSubtitle: { fontSize: 13, color: '#6B87A8', textAlign: 'center', lineHeight: 20, marginBottom: 22 },
    dotsRow: { flexDirection: 'row', alignItems: 'center' },

    // ── Vendor accepted sheet ─────────────────────────────────────────────
    vendorSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: screenHeight * 0.50,
        overflow: 'hidden'
    },
    vendorBanner: {
        backgroundColor: '#15803D',
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 20
    },
    vendorBannerDragHandle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.35)',
        alignSelf: 'center',
        marginBottom: 14
    },
    vendorBannerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    vendorBannerTitleRow: { flexDirection: 'row', alignItems: 'center' },
    vendorBannerCheckCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    vendorBannerCheck: { fontSize: 14, color: '#fff', fontWeight: '700' },
    vendorBannerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    vendorBannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 19 },
    closeBtnWhite: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    closeBtnTextWhite: { fontSize: 14, color: '#fff', fontWeight: '600', lineHeight: 20 },

    vendorProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF4FB'
    },
    vendorAvatarWrap: { position: 'relative', marginRight: 14 },
    vendorAvatarLg: {
        width: 74,
        height: 74,
        borderRadius: 37,
        backgroundColor: '#D9E8F9',
        borderWidth: 3,
        borderColor: '#fff',
        elevation: 5
    },
    vendorOnlineDot: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 17,
        height: 17,
        borderRadius: 8.5,
        backgroundColor: '#16A34A',
        borderWidth: 2.5,
        borderColor: '#fff'
    },
    vendorInfo: { flex: 1 },
    vendorNameLg: { fontSize: 18, fontWeight: '800', color: '#1A2C45', marginBottom: 4 },
    vendorCatBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#EBF3FF',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginBottom: 6
    },
    vendorCatText: { fontSize: 11, fontWeight: '700', color: '#0C5BC2', letterSpacing: 0.4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingStars: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },
    ratingCount: { fontSize: 12, color: '#8BA3C0', marginLeft: 4 },

    onWayBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        backgroundColor: '#F0FDF4',
        borderBottomWidth: 1,
        borderBottomColor: '#DCFCE7'
    },
    onWayText: { fontSize: 13, fontWeight: '600', color: '#15803D', marginLeft: 10, flex: 1 },
    onWayEta: { fontSize: 12, fontWeight: '700', color: '#16A34A' },

    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF4FB'
    },
    statBox: {
        flex: 1,
        backgroundColor: '#F7FAFF',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4EFF9',
        marginHorizontal: 3
    },
    statEmoji: { fontSize: 15, marginBottom: 4 },
    statValue: { fontSize: 14, fontWeight: '800', color: '#1A2C45' },
    statLabel: { fontSize: 10, fontWeight: '500', color: '#8BA3C0', marginTop: 2 },

    trackingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF4FB'
    },
    trackingText: { fontSize: 12, color: '#4B6A8B', marginLeft: 8, flex: 1 },
    liveBadge: {
        fontSize: 10,
        fontWeight: '700',
        color: '#0C5BC2',
        backgroundColor: '#EBF3FF',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 4,
        letterSpacing: 0.5
    },

    vendorActionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingVertical: 14,
        paddingBottom: 28
    },
    contactBtn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#0C5BC2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8
    },
    contactBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    cancelBtn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FECACA'
    },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#DC2626' }
})

const InstantHirePage = ({ navigation, route }) => {
    const mapRef = useRef(null)
    const mapReadyRef = useRef(false)
    const pendingCoordsRef = useRef(null)
    const searchDebounce = useRef(null)

    // Radar animation values
    const ring1Scale   = useRef(new Animated.Value(0.2)).current
    const ring1Opacity = useRef(new Animated.Value(0)).current
    const ring2Scale   = useRef(new Animated.Value(0.2)).current
    const ring2Opacity = useRef(new Animated.Value(0)).current
    const ring3Scale   = useRef(new Animated.Value(0.2)).current
    const ring3Opacity = useRef(new Animated.Value(0)).current

    // On-the-way dot breathe
    const breatheAnim = useRef(new Animated.Value(1)).current

    const [user, setUser]                     = useState(null)
    const [serviceLocation, setServiceLocation] = useState(DEFAULT_REGION)
    const [isLocationLoading, setLocationLoading] = useState(true)

    const [selectedLocationText, setSelectedLocationText] = useState(null)
    const [isLocationModalVisible, setLocationModalVisible] = useState(false)
    const [locationSearchQuery, setLocationSearchQuery]     = useState('')
    const [locationSuggestions, setLocationSuggestions]     = useState([])
    const [isSuggestionsLoading, setSuggestionsLoading]     = useState(false)

    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isCategoryOpen, setCategoryOpen]       = useState(false)

    const [searchingVisible, setSearchingVisible]         = useState(false)
    const [dotPhase, setDotPhase]                         = useState(0)
    const [vendorAcceptedVisible, setVendorAcceptedVisible] = useState(false)
    const [acceptedWorker, setAcceptedWorker]             = useState(null)
    const [vendorMapLocation, setVendorMapLocation]       = useState(null)

    const activeCategory = useMemo(
        () => CATEGORY_OPTIONS.find((item) => item.id === selectedCategory),
        [selectedCategory]
    )

    const canFindService = selectedLocationText !== null && selectedCategory !== null

    // ── Radar animation ───────────────────────────────────────────────────

    useEffect(() => {
        if (!searchingVisible) {
            ring1Scale.setValue(0.2);   ring1Opacity.setValue(0)
            ring2Scale.setValue(0.2);   ring2Opacity.setValue(0)
            ring3Scale.setValue(0.2);   ring3Opacity.setValue(0)
            return
        }

        let active = true

        const runCycle = () => {
            if (!active) return
            ring1Scale.setValue(0.2);   ring1Opacity.setValue(0.85)
            ring2Scale.setValue(0.2);   ring2Opacity.setValue(0.85)
            ring3Scale.setValue(0.2);   ring3Opacity.setValue(0.85)

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
            ]).start(({ finished }) => {
                if (finished && active) runCycle()
            })
        }

        runCycle()
        return () => { active = false }
    }, [searchingVisible])

    // Animated dots for searching card
    useEffect(() => {
        if (!searchingVisible) return
        const timer = setInterval(() => setDotPhase(p => (p + 1) % 3), 420)
        return () => clearInterval(timer)
    }, [searchingVisible])

    // Pulsing green dot on vendor accepted sheet
    useEffect(() => {
        if (!vendorAcceptedVisible) return
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(breatheAnim, { toValue: 0.2,  duration: 650, useNativeDriver: true }),
                Animated.timing(breatheAnim, { toValue: 1,    duration: 650, useNativeDriver: true })
            ])
        )
        anim.start()
        return () => anim.stop()
    }, [vendorAcceptedVisible])

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
            // Map not ready yet — queue the animation for onMapReady
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
        // Try Google Geocoding first if key is available
        if (GOOGLE_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY') {
            try {
                const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&language=en&result_type=sublocality|locality`
                const res = await fetch(url)
                const data = await res.json()
                if (data.status === 'OK' && data.results.length > 0) {
                    const components = data.results[0].address_components
                    const sub = components.find(c => c.types.includes('sublocality_level_1') || c.types.includes('sublocality'))
                    const city = components.find(c => c.types.includes('locality'))
                    const district = components.find(c => c.types.includes('administrative_area_level_2'))
                    const parts = [sub?.long_name, city?.long_name || district?.long_name].filter(Boolean)
                    return parts.length > 0 ? parts.join(', ') : data.results[0].formatted_address.split(',').slice(0, 2).join(',').trim()
                }
            } catch (_) { /* fall through */ }
        }

        // Free fallback: OpenStreetMap Nominatim (no key needed)
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
        } catch (_) { /* fall through */ }

        return 'My Current Location'
    }

    const fetchCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission()
        if (!hasPermission) {
            setLocationLoading(false)
            return
        }

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

        // First attempt: GPS (high accuracy)
        Geolocation.getCurrentPosition(
            onSuccess,
            () => {
                // GPS timed out — fall back to network / cell-tower location
                Geolocation.getCurrentPosition(
                    onSuccess,
                    onFinalError,
                    { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
                )
            },
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

    useFocusEffect(
        useCallback(() => { setUser((prev) => prev) }, [])
    )

    // ── Search suggestions ────────────────────────────────────────────────

    const fetchSuggestions = async (query) => {
        if (!query || query.trim().length < 2) { setLocationSuggestions([]); return }
        setSuggestionsLoading(true)

        if (GOOGLE_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY') {
            try {
                const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&language=en&components=country:bd`
                const res = await fetch(url)
                const data = await res.json()
                if (data.status === 'OK' && data.predictions.length > 0) {
                    setLocationSuggestions(
                        data.predictions.map((p) => ({ place_id: p.place_id, description: p.description, lat: null, lng: null }))
                    )
                    setSuggestionsLoading(false)
                    return
                }
            } catch (_) { /* fall through to local list */ }
        }

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
        closeLocationModal()
        setLocationLoading(true)
        fetchCurrentLocation()
    }

    const closeLocationModal = () => {
        setLocationModalVisible(false)
        setLocationSearchQuery('')
        setLocationSuggestions([])
    }

    // ── Map interactions ──────────────────────────────────────────────────

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

    // ── Find service ──────────────────────────────────────────────────────

    const handleFindService = () => {
        if (!canFindService) return
        setSearchingVisible(true)
        setTimeout(() => {
            const worker = ACCEPTED_WORKERS[selectedCategory]
            setAcceptedWorker(worker)
            // Place vendor marker slightly offset from service location
            setVendorMapLocation({
                latitude: serviceLocation.latitude + worker.distance * 0.0065,
                longitude: serviceLocation.longitude - worker.distance * 0.0038
            })
            setSearchingVisible(false)
            setVendorAcceptedVisible(true)
        }, 3400)
    }

    const handleCloseVendor = () => {
        setVendorAcceptedVisible(false)
        setAcceptedWorker(null)
        setVendorMapLocation(null)
    }

    // ── Render ────────────────────────────────────────────────────────────

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
                    onPress={handleMapPress}
                >
                    <Marker
                        coordinate={serviceLocation}
                        draggable
                        onDragEnd={handleMarkerDragEnd}
                        title='Service location'
                    />
                    {vendorMapLocation && (
                        <Marker
                            coordinate={vendorMapLocation}
                            title={acceptedWorker?.name}
                            description={`${activeCategory?.label} • ${acceptedWorker?.distance} km away`}
                            pinColor='#16A34A'
                        />
                    )}
                </MapView>

                <View style={styles.panel}>
                    {/* Service location picker */}
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

                    {/* Category picker */}
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

                    {/* Find Service button */}
                    <TouchableOpacity
                        activeOpacity={canFindService ? 0.85 : 1}
                        style={[styles.findBtn, canFindService ? styles.findBtnActive : styles.findBtnDim]}
                        onPress={handleFindService}
                        disabled={!canFindService}
                    >
                        <Text style={styles.findBtnText}>Find Service</Text>
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

            {/* ── Searching modal (radar animation) ────────────────────────── */}
            <Modal visible={searchingVisible} transparent animationType='fade' onRequestClose={() => {}}>
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
                                        width: 9,
                                        height: 9,
                                        borderRadius: 4.5,
                                        marginHorizontal: 4,
                                        backgroundColor: dotPhase === i ? '#0C5BC2' : '#D4E3F5'
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Vendor accepted modal ─────────────────────────────────────── */}
            <Modal
                visible={vendorAcceptedVisible}
                transparent
                animationType='slide'
                onRequestClose={handleCloseVendor}
            >
                <View style={styles.modalBackdrop}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => {}} />
                    <View style={styles.vendorSheet}>

                        {/* Green accepted banner with embedded drag handle */}
                        <View style={styles.vendorBanner}>
                            <View style={styles.vendorBannerDragHandle} />
                            <View style={styles.vendorBannerRow}>
                                <View style={styles.vendorBannerTitleRow}>
                                    <View style={styles.vendorBannerCheckCircle}>
                                        <Text style={styles.vendorBannerCheck}>✓</Text>
                                    </View>
                                    <Text style={styles.vendorBannerTitle}>Request Accepted!</Text>
                                </View>
                                {/* close button hidden intentionally */}
                            </View>
                            {acceptedWorker && (
                                <Text style={styles.vendorBannerSub}>
                                    {acceptedWorker.name} accepted your request and is on his way to you
                                </Text>
                            )}
                        </View>

                        {acceptedWorker && (
                            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                                {/* Vendor profile row */}
                                <View style={styles.vendorProfileRow}>
                                    <View style={styles.vendorAvatarWrap}>
                                        <Image source={acceptedWorker.avatar} style={styles.vendorAvatarLg} />
                                        <View style={styles.vendorOnlineDot} />
                                    </View>
                                    <View style={styles.vendorInfo}>
                                        <Text style={styles.vendorNameLg}>{acceptedWorker.name}</Text>
                                        <View style={styles.vendorCatBadge}>
                                            <Text style={styles.vendorCatText}>
                                                {activeCategory?.label?.toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.ratingRow}>
                                            <Text style={styles.ratingStars}>
                                                {'★'.repeat(Math.round(acceptedWorker.rating))} {acceptedWorker.rating}
                                            </Text>
                                            <Text style={styles.ratingCount}>(128 reviews)</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* On the way banner */}
                                <View style={styles.onWayBanner}>
                                    <Animated.View
                                        style={{
                                            width: 11,
                                            height: 11,
                                            borderRadius: 5.5,
                                            backgroundColor: '#16A34A',
                                            opacity: breatheAnim
                                        }}
                                    />
                                    <Text style={styles.onWayText}>On the way · Heading to your location</Text>
                                    <Text style={styles.onWayEta}>~{acceptedWorker.eta} min</Text>
                                </View>

                                {/* Stats */}
                                <View style={styles.statsRow}>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statEmoji}>🎓</Text>
                                        <Text style={styles.statValue}>{acceptedWorker.experience} yrs</Text>
                                        <Text style={styles.statLabel}>Experience</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statEmoji}>💰</Text>
                                        <Text style={styles.statValue}>৳{acceptedWorker.rate}</Text>
                                        <Text style={styles.statLabel}>Per Hour</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statEmoji}>📍</Text>
                                        <Text style={styles.statValue}>{acceptedWorker.distance} km</Text>
                                        <Text style={styles.statLabel}>Distance</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statEmoji}>⏱</Text>
                                        <Text style={styles.statValue}>{acceptedWorker.eta} min</Text>
                                        <Text style={styles.statLabel}>ETA</Text>
                                    </View>
                                </View>

                                {/* Live tracking row — hidden until feature is ready
                                <View style={styles.trackingRow}>
                                    <Text style={{ fontSize: 16 }}>🗺️</Text>
                                    <Text style={styles.trackingText}>
                                        Vendor location is shown on the map
                                    </Text>
                                    <Text style={styles.liveBadge}>LIVE</Text>
                                </View>
                                */}

                                {/* Action buttons — hidden until feature is ready
                                <View style={styles.vendorActionsRow}>
                                    <TouchableOpacity style={styles.contactBtn} activeOpacity={0.85}>
                                        <Text style={styles.contactBtnText}>📞  Contact</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.85} onPress={handleCloseVendor}>
                                        <Text style={styles.cancelBtnText}>Cancel Request</Text>
                                    </TouchableOpacity>
                                </View>
                                */}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default InstantHirePage
