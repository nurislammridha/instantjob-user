import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

const styles = StyleSheet.create({
    con: {
        marginTop: 30,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        width: 290,
        height: 54,
    },
    phoneInput: {
        marginRight: 5,
        textAlign: 'center',
        width: 54,
        fontSize: 18,
        fontWeight: '600',
        borderRadius: 10,
        color: '#2A2A38',
        backgroundColor: '#EFEFEF',
    },
});

const OtpInput = ({ otp, inputs, handleInputChange }) => {
    return (
        <View style={styles.con}>
            <View style={styles.container}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (inputs.current[index] = ref)}
                        style={styles.phoneInput}
                        placeholder="-"
                        keyboardType="numeric"
                        maxLength={1}
                        value={digit}
                        onChangeText={(value) => handleInputChange(value, index)}
                        onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === 'Backspace' && otp[index] === '') {
                                if (index > 0) {
                                    inputs.current[index - 1]?.focus();
                                }
                            }
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

export default OtpInput;
