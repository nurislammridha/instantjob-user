import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
const styles = StyleSheet.create({

})
const PrimaText = ({
    content = "Our Text",
    top = 0,
    left = 0,
    right = 0,
    bottom = 0,
    size = 16,
    weight = "normal",
    decoration = "none",
    color = "#000",
    align = "left",
    bgColor = "#fff",
    width = "auto",
    opacity = 1
}) => {
    return (
        <View style={{ marginTop: top, marginLeft: left, marginRight: right, marginBottom: bottom, width }}>
            <Text style={{ fontSize: size, fontWeight: weight, textDecorationLine: decoration, color, textAlign: align, opacity, fontFamily: 'Roboto', }}>
                {content}
            </Text>
        </View>
    )
}

export default PrimaText