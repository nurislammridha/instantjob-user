import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import PrimaButton from '../components/PrimaButton';
import PrimaInput from '../components/PrimaInput';
import PrimaText from '../components/PrimaText';
import { FalseForgotPasswordSubmitted, SubmitForgotPassword } from '../redux/_redux/AuthAction';
import { validateEmail } from '../assets/functions/helperFunction';

const ForgotPasswordPage = ({ navigation }) => {
    const dispatch = useDispatch();
    const { isForgotPasswordLoading, forgotPasswordSubmitted } = useSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [touched, setTouched] = useState(false);
    const [emailValid, setEmailValid] = useState(false);

    useEffect(() => {
        if (!touched) return;
        setEmailValid(validateEmail(email).isValid);
    }, [email, touched]);

    useEffect(() => {
        if (forgotPasswordSubmitted) {
            dispatch(FalseForgotPasswordSubmitted());
            navigation.navigate('ForgotOtp');
        }
    }, [forgotPasswordSubmitted]);

    const handleSubmit = () => {
        if (!emailValid || isForgotPasswordLoading) return;
        dispatch(SubmitForgotPassword({ email }));
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>
                <View>
                    <PrimaText content="Forgot Password?" weight="700" size={26} color="#2A2A38" top={40} />
                    <PrimaText
                        content="Enter your registered email. We will send you a verification code."
                        weight="400"
                        size={14}
                        color="#777D88"
                        top={8}
                        bottom={30}
                    />

                    <PrimaText content="Email Address" weight="600" size={14} color="#2A2A38" bottom={6} />
                    <PrimaInput
                        placeholder="Enter your email"
                        value={email}
                        keyboardType="email-address"
                        isValid={touched ? emailValid : true}
                        validationTxt="Enter a valid email address"
                        onChange={(val) => {
                            if (!touched) setTouched(true);
                            setEmail(val);
                        }}
                    />
                </View>

                <View style={styles.bottom}>
                    <PrimaButton
                        content="← Back"
                        width={100}
                        height={56}
                        bottom={30}
                        radius={10}
                        bgColor="#EFEFEF"
                        weight="600"
                        color="#2A2A38"
                        size={15}
                        onPress={() => navigation.goBack()}
                    />
                    <PrimaButton
                        content="Send OTP"
                        width={180}
                        height={56}
                        bottom={30}
                        radius={10}
                        opacity={emailValid ? 1 : 0.5}
                        weight="700"
                        color="#2A2A38"
                        size={15}
                        isLoading={isForgotPasswordLoading}
                        onPress={handleSubmit}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#FFF' },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default ForgotPasswordPage;
