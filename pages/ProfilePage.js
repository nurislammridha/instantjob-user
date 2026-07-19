import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
    PermissionsAndroid
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { launchImageLibrary } from 'react-native-image-picker'
import PrimaText from '../components/PrimaText'
import man from '../assets/images/man.png'
import { UpdateProfile } from '../redux/_redux/ProfileAction'
import { uploadImageToCloudinary } from '../assets/functions/cloudinary'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7FB'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E3EAF4'
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center'
    },
    body: {
        flex: 1,
        paddingBottom: 30
    },
    avatarSection: {
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 20
    },
    avatarWrap: {
        position: 'relative',
        width: 96,
        height: 96
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        borderColor: '#0A5CC1'
    },
    avatarUploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#0A5CC1',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    editBadgeText: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 16
    },
    form: {
        paddingHorizontal: 20,
        marginTop: 8
    },
    fieldGroup: {
        marginBottom: 18
    },
    label: {
        marginBottom: 6
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D8E2F0',
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 15,
        color: '#1E2E45',
        fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System'
    },
    inputDisabled: {
        backgroundColor: '#F0F4FA',
        color: '#8A9BB5'
    },
    buttonsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 10
    },
    btnCancel: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D8E2F0',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    btnSave: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#0A5CC1',
        alignItems: 'center'
    },
    btnSaveDisabled: {
        backgroundColor: '#A0B9E0'
    }
})

const ProfilePage = ({ navigation }) => {
    const dispatch = useDispatch()
    const { user, isProfileLoading } = useSelector((state) => state.auth)

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [avatarUri, setAvatarUri] = useState(null)
    const [avatar, setAvatar] = useState(null)
    const [isAvatarUploading, setIsAvatarUploading] = useState(false)

    useEffect(() => {
        if (user) {
            setName(user.name || '')
            setPhone(user.phone || '')
            setAvatarUri(user.avatar?.url || null)
            setAvatar(null)
        }
    }, [user])

    const openImagePicker = () => {
        launchImageLibrary(
            { mediaType: 'photo', maxWidth: 600, maxHeight: 600, quality: 0.8 },
            async (response) => {
                if (response.didCancel || response.errorCode) return
                const asset = response.assets && response.assets[0]
                if (!asset) return

                setAvatarUri(asset.uri)
                setIsAvatarUploading(true)
                try {
                    const uploaded = await uploadImageToCloudinary(asset)
                    setAvatar(uploaded)
                } catch (e) {
                    const detail = e?.response?.data?.error?.message || e?.message || 'Unknown error'
                    console.log('Cloudinary upload error:', e?.response?.data || e?.message || e)
                    Alert.alert('Upload Failed', detail)
                    setAvatarUri(user?.avatar?.url || null)
                } finally {
                    setIsAvatarUploading(false)
                }
            }
        )
    }

    const handlePickImage = async () => {
        // iOS: launchImageLibrary handles its own permission dialog
        if (Platform.OS !== 'android') {
            openImagePicker()
            return
        }

        const androidVersion = parseInt(Platform.Version, 10)
        const permission = androidVersion >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE

        // Already granted — go straight to gallery
        const alreadyGranted = await PermissionsAndroid.check(permission)
        if (alreadyGranted) {
            openImagePicker()
            return
        }

        // Request permission — Android shows its own system dialog here
        const result = await PermissionsAndroid.request(permission, {
            title: 'Allow Photo Access',
            message: 'instantJobUser needs access to your photos so you can update your profile picture.',
            buttonPositive: 'Allow All',
            buttonNegative: 'Deny',
            buttonNeutral: 'Ask Me Later',
        })

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
            openImagePicker()
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
                'Permission Blocked',
                'Photo access is permanently blocked. Open Settings > Apps > instantJobUser > Permissions and enable Photos.',
                [{ text: 'OK' }]
            )
        }
        // DENIED: user pressed Deny — system dialog already gave them feedback, nothing more needed
    }

    const handleSave = () => {
        if (!name.trim()) return
        dispatch(
            UpdateProfile({ name: name.trim(), phone, avatar }, () => {
                navigation.goBack()
            })
        )
    }

    const handleCancel = () => {
        navigation.goBack()
    }

    const avatarSource = avatarUri ? { uri: avatarUri } : man

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <View style={styles.headerTitle}>
                    <PrimaText content='Profile' weight='600' size={17} color='#1E2E45' align='center' />
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.body} keyboardShouldPersistTaps='handled'>
                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.85} onPress={handlePickImage} disabled={isAvatarUploading}>
                        <Image source={avatarSource} style={styles.avatar} />
                        {isAvatarUploading ? (
                            <View style={styles.avatarUploadingOverlay}>
                                <ActivityIndicator color='#fff' />
                            </View>
                        ) : (
                            <View style={styles.editBadge}>
                                <PrimaText content='✎' size={13} color='#fff' />
                            </View>
                        )}
                    </TouchableOpacity>
                    <PrimaText content='Tap photo to change' size={12} weight='400' color='#8A9BB5' top={8} />
                </View>

                <View style={styles.form}>
                    <View style={styles.fieldGroup}>
                        <PrimaText content='Full Name' size={13} weight='500' color='#607089' style={styles.label} />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder='Your name'
                            placeholderTextColor='#B0BEC5'
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <PrimaText content='Email' size={13} weight='500' color='#607089' style={styles.label} />
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={user?.email || ''}
                            editable={false}
                            selectTextOnFocus={false}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <PrimaText content='Phone' size={13} weight='500' color='#607089' style={styles.label} />
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder='Phone number'
                            placeholderTextColor='#B0BEC5'
                            keyboardType='phone-pad'
                        />
                    </View>
                </View>

                <View style={styles.buttonsRow}>
                    <TouchableOpacity style={styles.btnCancel} activeOpacity={0.8} onPress={handleCancel}>
                        <PrimaText content='Cancel' size={15} weight='600' color='#607089' />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnSave, (isProfileLoading || isAvatarUploading) && styles.btnSaveDisabled]}
                        activeOpacity={0.85}
                        onPress={handleSave}
                        disabled={isProfileLoading || isAvatarUploading}
                    >
                        {isProfileLoading ? (
                            <ActivityIndicator color='#fff' />
                        ) : (
                            <PrimaText content='Save Changes' size={15} weight='600' color='#fff' />
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default ProfilePage
