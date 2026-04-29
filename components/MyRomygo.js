import React from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import img from '../assets/images/rom2.png'
import PrimaText from './PrimaText'
const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 20
    },
    img: {
        width: 149,
        height: 107,
        borderRadius: 5
    },
    item: {
        marginRight: 16
    }
})
const MyRomygo = ({ left = 20 }) => {
    return (
        <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
        >
            <View style={styles.container}>
                {[1, 2, 3, 4, 4, 5].map((_, index) => (
                    <View style={styles.item} key={index}>
                        <Image source={img} style={styles.img} />
                        <PrimaText
                            content='Romygo Difference'
                            color='#2A2A38'
                            weight='500'
                            size={14}
                            top={8}
                        />
                    </View>
                ))}

            </View>
        </ScrollView>
    )
}

export default MyRomygo