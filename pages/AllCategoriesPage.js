import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import PrimaHeader from '../components/PrimaHeader'
import PrimaText from '../components/PrimaText'
import GoingInput from '../components/GoingInput'
import car from '../assets/icons/car.png'
import watch from '../assets/icons/watch.png'
import preferences from '../assets/icons/preferences.png'
import pointer from '../assets/icons/pointer.png'
import payment from '../assets/icons/payment.png'
import star from '../assets/icons/star.png'
import { FetchAllCategories } from '../redux/_redux/CategoryAction'

const FALLBACK_ICONS = [car, watch, preferences, pointer, payment, star]
const CARD_COLORS = ['#EAF2FF', '#FFF1E6', '#EAFBF1', '#F3EAFF', '#FFEAF0', '#EAF7FF']

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7FB'
    },
    body: {
        flex: 1,
        paddingTop: 12
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        paddingTop: 16
    },
    cardSlot: {
        width: '50%',
        padding: 6
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E3EAF4',
        overflow: 'hidden'
    },
    iconWrap: {
        width: '100%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        tintColor: '#0A5CC1'
    },
    apiIcon: {
        width: '100%',
        aspectRatio: 1,
        resizeMode: 'cover'
    },
    titleWrap: {
        paddingHorizontal: 8,
        paddingVertical: 8
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60
    }
})

const AllCategoriesPage = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const { categories, isCategoriesLoading } = useSelector((state) => state.category)
    const [searchTerm, setSearchTerm] = useState(route?.params?.searchTerm || '')

    useEffect(() => {
        dispatch(FetchAllCategories())
    }, [])

    useEffect(() => {
        if (route?.params?.searchTerm !== undefined) {
            setSearchTerm(route.params.searchTerm)
        }
    }, [route?.params?.searchTerm])

    const filteredCategories = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) return categories
        return categories.filter((cat) => cat.categoryName?.toLowerCase().includes(term))
    }, [categories, searchTerm])

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <PrimaHeader
                    left={20}
                    right={20}
                    navigation={navigation}
                    route={route}
                    content='All Categories'
                    isRightIcon={false}
                    leftIcon={null}
                />
                <GoingInput
                    top={4}
                    left={20}
                    right={20}
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder='Search categories in instant job'
                    autoFocus={!!route?.params?.searchTerm}
                />
                {isCategoriesLoading ? (
                    <ActivityIndicator color='#0A5CC1' style={{ marginTop: 40 }} />
                ) : filteredCategories.length === 0 ? (
                    <View style={styles.empty}>
                        <PrimaText
                            content={searchTerm ? `No categories found for "${searchTerm}"` : 'No categories found'}
                            size={15}
                            weight='500'
                            color='#607089'
                            align='center'
                        />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.grid}>
                            {filteredCategories.map((cat, idx) => {
                                const hasImage = cat.img && cat.img.url
                                const fallbackIcon = FALLBACK_ICONS[idx % FALLBACK_ICONS.length]
                                const bgColor = CARD_COLORS[idx % CARD_COLORS.length]
                                return (
                                    <View key={cat._id} style={styles.cardSlot}>
                                        <TouchableOpacity activeOpacity={0.9} style={styles.card}>
                                            {hasImage ? (
                                                <Image source={{ uri: cat.img.url }} style={styles.apiIcon} />
                                            ) : (
                                                <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
                                                    <Image source={fallbackIcon} style={styles.icon} />
                                                </View>
                                            )}
                                            <View style={styles.titleWrap}>
                                                <PrimaText
                                                    content={cat.categoryName}
                                                    size={12}
                                                    weight='600'
                                                    color='#223B5D'
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>
                )}
            </View>
        </View>
    )
}

export default AllCategoriesPage
