import React, { useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import PrimaText from './PrimaText';
const styles = StyleSheet.create({
    input: {
        paddingLeft: 20,
        color: '#777D88',
        fontSize: 14,
        fontWeight: "500",
        borderRadius: 10,
        backgroundColor: '#EFEFEF',
    },
});
const PrimaInput = ({
    maxLength = 30,
    placeholder = "Enter",
    width = "100%",
    height = 54,
    value,
    onChange,
    keyboardType = "text",
    isValid = true,
    validationTxt = "Field should n't be empty",
    secure = false,
    editable = true,
    top = 0
}) => {

    return (<>
        <TextInput
            style={{ ...styles.input, width, height, marginTop: top }}
            placeholder={placeholder}
            keyboardType={keyboardType}
            value={value}
            onChangeText={onChange}
            maxLength={maxLength}
            secureTextEntry={secure}
            editable={editable}
        />
        {!isValid &&
            <PrimaText
                content={validationTxt}
                color='#F00'
                size={13}
                top={2}
            />
        }

    </>)
}

export default PrimaInput