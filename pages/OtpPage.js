import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import PrimaButton from '../components/PrimaButton';
import PrimaText from '../components/PrimaText';
import OtpInput from '../components/OtpInput';
import {
    FalseOtpVerified,
    ResendOtp,
    VerifySignupOtp,
    FalseLoginSubmitted,
} from '../redux/_redux/AuthAction';

const OTP_TIMER = 120; // 2 minutes

const OtpPage = ({ navigation }) => {
    const dispatch = useDispatch();
    const { isOtpLoading, otpVerified, isResendOtpLoading, pendingEmail, loginSubmitted } =
        useSelector((state) => state.auth);

    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
    const [timeLeft, setTimeLeft] = useState(OTP_TIMER);
    const [canResend, setCanResend] = useState(false);
    const inputs = useRef([]);

    const isValid = otp.every((d) => d !== '');

    const handleInputChange = (value, index) => {
        const newOtp = [...otp];
        if (value) {
            newOtp[index] = value;
            if (index < otp.length - 1) inputs.current[index + 1]?.focus();
        } else {
            newOtp[index] = '';
        }
        setOtp(newOtp);
    };

    const formatTime = () => {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleResend = () => {
        if (!canResend || isResendOtpLoading || !pendingEmail) return;
        dispatch(ResendOtp({ email: pendingEmail, purpose: 'signup' }));
        setTimeLeft(OTP_TIMER);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
    };

    const handleVerify = () => {
        if (!isValid || isOtpLoading || !pendingEmail) return;
        dispatch(VerifySignupOtp({ email: pendingEmail, otp }));
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    useEffect(() => {
        if (otpVerified) {
            dispatch(FalseOtpVerified());
        }
        if (loginSubmitted) {
            dispatch(FalseLoginSubmitted());
            navigation.replace('Home');
        }
    }, [otpVerified, loginSubmitted]);

    useFocusEffect(
        useCallback(() => {
            setTimeLeft(OTP_TIMER);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
        }, [])
    );

    return (
        <View style={styles.container}>
            <View>
                <PrimaText content="Verify Your Email" weight="700" size={24} color="#2A2A38" top={40} />
                <PrimaText
                    content={`A 6-digit OTP was sent to ${pendingEmail || 'your email'}`}
                    weight="400"
                    size={14}
                    color="#777D88"
                    top={8}
                />

                <OtpInput otp={otp} inputs={inputs} handleInputChange={handleInputChange} />

                <View style={styles.timerRow}>
                    <PrimaButton
                        content={
                            !canResend
                                ? `Resend OTP in ${formatTime()}`
                                : isResendOtpLoading
                                ? 'Sending...'
                                : 'Resend OTP'
                        }
                        width={200}
                        height={40}
                        top={24}
                        radius={20}
                        opacity={canResend ? 1 : 0.5}
                        bgColor="#EFEFEF"
                        weight="500"
                        color="#2A2A38"
                        size={14}
                        isLoading={isResendOtpLoading}
                        onPress={handleResend}
                    />
                </View>
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
                    content="Verify →"
                    width={160}
                    height={56}
                    bottom={30}
                    radius={10}
                    opacity={isValid ? 1 : 0.5}
                    weight="700"
                    color="#2A2A38"
                    size={15}
                    isLoading={isOtpLoading}
                    onPress={handleVerify}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
    },
    timerRow: { alignItems: 'center' },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default OtpPage;
