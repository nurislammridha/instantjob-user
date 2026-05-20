import React, { useEffect } from 'react'
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import PrimaHeader from '../components/PrimaHeader'
import PrimaText from '../components/PrimaText'
import car from '../assets/icons/car.png'
import watch from '../assets/icons/watch.png'
import preferences from '../assets/icons/preferences.png'
import pointer from '../assets/icons/pointer.png'
import payment from '../assets/icons/payment.png'
import star from '../assets/icons/star.png'
import { FetchAllCategories } from '../redux/_redux/CategoryAction'

const windowWidth = Dimensions.get('window').width
const FALLBACK_ICONS = [car, watch, preferences, pointer, payment, star]

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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 30
    },
    card: {
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
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#EAF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    icon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        tintColor: '#0A5CC1'
    },
    apiIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        marginBottom: 8,
        resizeMode: 'cover'
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

    useEffect(() => {
        dispatch(FetchAllCategories())
    }, [])

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
                {isCategoriesLoading ? (
                    <ActivityIndicator color='#0A5CC1' style={{ marginTop: 40 }} />
                ) : categories.length === 0 ? (
                    <View style={styles.empty}>
                        <PrimaText content='No categories found' size={15} weight='500' color='#607089' />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.grid}>
                            {categories.map((cat, idx) => {
                                const hasImage = cat.img && cat.img.url
                                const fallbackIcon = FALLBACK_ICONS[idx % FALLBACK_ICONS.length]
                                return (
                                    <TouchableOpacity key={cat._id} activeOpacity={0.9} style={styles.card}>
                                        {hasImage ? (
                                            <Image source={{ uri: cat.img.url }} style={styles.apiIcon} />
                                        ) : (
                                            <View style={styles.iconWrap}>
                                                <Image source={fallbackIcon} style={styles.icon} />
                                            </View>
                                        )}
                                        <PrimaText
                                            content={cat.categoryName}
                                            size={13}
                                            weight='600'
                                            align='center'
                                            color='#223B5D'
                                        />
                                    </TouchableOpacity>
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
