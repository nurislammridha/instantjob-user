import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import PrimaButton from '../components/PrimaButton';
import PrimaInput from '../components/PrimaInput';
import PrimaText from '../components/PrimaText';
import { FalseLoginSubmitted, FalseRequiresEmailVerification, SubmitLogin } from '../redux/_redux/AuthAction';
import { validateEmail } from '../assets/functions/helperFunction';

const LoginPage = ({ navigation }) => {
    const dispatch = useDispatch();
    const { isLoginLoading, loginSubmitted, requiresEmailVerification } = useSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);

    useEffect(() => {
        if (!emailTouched) return;
        setEmailValid(validateEmail(email).isValid);
    }, [email, emailTouched]);

    useEffect(() => {
        setPasswordValid(password.length >= 6);
    }, [password]);

    useEffect(() => {
        if (loginSubmitted) {
            dispatch(FalseLoginSubmitted());
            navigation.replace('Home');
        }
    }, [loginSubmitted]);

    useEffect(() => {
        if (requiresEmailVerification) {
            dispatch(FalseRequiresEmailVerification());
            navigation.navigate('Otp', { purpose: 'signup' });
        }
    }, [requiresEmailVerification]);

    const handleLogin = () => {
        if (!emailValid || !passwordValid || isLoginLoading) return;
        dispatch(SubmitLogin({ email, password }));
    };

    const canSubmit = emailValid && passwordValid;

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.top}>
                    <PrimaText content="Welcome Back" weight="700" size={28} color="#2A2A38" top={40} />
                    <PrimaText content="Sign in to continue" weight="400" size={15} color="#777D88" top={6} bottom={30} />

                    <PrimaText content="Email" weight="600" size={14} color="#2A2A38" bottom={6} />
                    <PrimaInput
                        placeholder="Enter your email"
                        value={email}
                        keyboardType="email-address"
                        isValid={emailTouched ? emailValid : true}
                        validationTxt="Enter a valid email"
                        onChange={(val) => {
                            if (!emailTouched) setEmailTouched(true);
                            setEmail(val);
                        }}
                    />

                    <PrimaText content="Password" weight="600" size={14} color="#2A2A38" top={16} bottom={6} />
                    <PrimaInput
                        placeholder="Enter your password"
                        value={password}
                        secure={!showPassword}
                        isValid={password.length === 0 || passwordValid}
                        validationTxt="Password must be at least 6 characters"
                        onChange={setPassword}
                    />

                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showRow}>
                        <PrimaText
                            content={showPassword ? 'Hide password' : 'Show password'}
                            size={13}
                            color="#888"
                        />
                    </TouchableOpacity>

                    <View style={styles.row}>
                        <View style={styles.rowItem}>
                            <PrimaText content="Don't have an account?" size={13} color="#777D88" />
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <PrimaText content=" Sign Up" size={13} weight="700" color="#0A5CC1" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <PrimaText content="Forgot Password?" size={13} weight="600" color="#2A2A38" />
                        </TouchableOpacity>
                    </View>
                </View>

                <PrimaButton
                    content="LOGIN"
                    width="100%"
                    height={56}
                    radius={10}
                    bottom={30}
                    opacity={canSubmit ? 1 : 0.5}
                    weight="700"
                    size={16}
                    color="#2A2A38"
                    isLoading={isLoginLoading}
                    onPress={handleLogin}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#FFF' },
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    top: { flex: 1 },
    showRow: { alignSelf: 'flex-end', marginTop: 8 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    rowItem: { flexDirection: 'row', alignItems: 'center' },
});

export default LoginPage;
