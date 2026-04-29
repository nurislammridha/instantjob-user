import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native'
import PrimaHeader from '../components/PrimaHeader'
import Footer from '../components/Footer'
import GoingInput from '../components/GoingInput'
import PrimaText from '../components/PrimaText'
import PrimaButton from '../components/PrimaButton'
import rom from '../assets/images/rom1.png'
import MyRomygo from '../components/MyRomygo'

import { useFocusEffect } from '@react-navigation/native'
const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
    container: {
        paddingTop: 12,
        backgroundColor: '#fff',
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: "#FFF"
    },
    btn: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginLeft: 20
    },
    img: {
        width: windowWidth - 40,
        height: 116,
        marginLeft: 20,
        marginRight: 20,
        borderRadius: 8
    },
    foot: {
        position: 'absolute',
        bottom: 0
    }
})

const RidePage = ({ navigation, route }) => {
    const [user, setUser] = useState(null)

    useFocusEffect(
        useCallback(() => {
            // getData("user").then((res) => {
            //     res && setUser(res);
            // });
        }, [])
    );
    return (
        <View style={styles.container}>
            <View>
                <PrimaHeader
                    left={20}
                    right={20}
                    navigation={navigation}
                    route={route}
                    user={user}
                />
                <GoingInput
                    top={25}
                    left={20}
                    right={20}
                    onChange={(e) => navigation.navigate('LiveRide', { from: "goingInput" })}
                />
                <PrimaText
                    content='Our Services'
                    weight='600'
                    size={14}
                    color='#2A2A38'
                    top={20}
                    left={20}
                />
                <View style={styles.btn}>
                    <PrimaButton
                        width='auto'
                        height={41}
                        radius={20}
                        bgColor='#1A1788'
                        color='#FFF'
                        weight='500'
                        size={14}
                        content='Instant Job'
                        right={10}
                        ph={10}
                    />
                    <PrimaButton
                        width='auto'
                        height={41}
                        radius={20}
                        bgColor='#1A1788'
                        color='#FFF'
                        weight='500'
                        size={14}
                        content='Schedule Job'
                        right={10}
                        ph={10}
                    />
                    <PrimaButton
                        width='auto'
                        height={41}
                        radius={20}
                        bgColor='#1A1788'
                        color='#FFF'
                        weight='500'
                        size={14}
                        content='Post your Job'
                        right={10}
                        ph={10}
                    />
                </View>
                <PrimaText
                    color='#2A2A38'
                    content='Promotions'
                    weight='600'
                    size={14}
                    top={20}
                    left={20}
                    bottom={16}
                />
                <Image source={rom} style={styles.img} />
                <PrimaText
                    content='My InstantJob'
                    top={20}
                    color='#2A2A38'
                    weight='600'
                    size={14}
                    left={20}
                    bottom={16}
                />
                <MyRomygo />
            </View>
            <Footer navigation={navigation} route={route} />
        </View>
    )
}

export default RidePage