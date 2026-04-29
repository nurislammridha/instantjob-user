import React from 'react'
import { Image, StyleSheet, TextInput, View } from 'react-native'
import pointer from '../assets/icons/pointer.png'
const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFEFEF',
        borderRadius: 10
    },
    img: {
        width: 24,
        height: 24
    },
    input: {
        width: 300,
        height: 54,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 40,
        marginLeft: 0,
        color: '#777D88',
        fontSize: 14,
        fontWeight: "500",

    }
})
const GoingInput = ({
    top = 0,
    left = 0,
    right = 0,
    value,
    onChange }) => {
    return (
        <View style={{ ...styles.container, marginTop: top, marginLeft: left, marginRight: right }}>
            <View style={{
                position: "absolute",
                zIndex: 1,
                left: 10,
            }}>
                <Image source={pointer} style={styles.img} />
            </View>

            <TextInput
                value={value}
                onChangeText={onChange}
                style={styles.input}
                placeholder='How can we help you?'
            />
        </View>
    )
}

export default GoingInput