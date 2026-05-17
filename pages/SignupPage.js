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
import { FalseSignupSubmitted, SubmitSignup } from '../redux/_redux/AuthAction';
import { validateEmail } from '../assets/functions/helperFunction';

const SignupPage = ({ navigation }) => {
    const dispatch = useDispatch();
    const { isSignupLoading, signupSubmitted } = useSelector((state) => state.auth);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [emailValid, setEmailValid] = useState(false);

    useEffect(() => {
        if (!emailTouched) return;
        setEmailValid(validateEmail(email).isValid);
    }, [email, emailTouched]);

    useEffect(() => {
        if (signupSubmitted) {
            dispatch(FalseSignupSubmitted());
            navigation.navigate('Otp', { purpose: 'signup' });
        }
    }, [signupSubmitted]);

    const nameValid = name.trim().length >= 2;
    const passwordValid = password.length >= 6;
    const confirmValid = confirmPassword === password && confirmPassword.length >= 6;
    const canSubmit = nameValid && emailValid && passwordValid && confirmValid;

    const handleSignup = () => {
        if (!canSubmit || isSignupLoading) return;
        dispatch(SubmitSignup({ name: name.trim(), email, password, confirmPassword }));
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.top}>
                    <PrimaText content="Create Account" weight="700" size={28} color="#2A2A38" top={40} />
                    <PrimaText content="Fill in the details to get started" weight="400" size={15} color="#777D88" top={6} bottom={30} />

                    <PrimaText content="Full Name" weight="600" size={14} color="#2A2A38" bottom={6} />
                    <PrimaInput
                        placeholder="Enter your full name"
                        value={name}
                        isValid={name.length === 0 || nameValid}
                        validationTxt="Name must be at least 2 characters"
                        onChange={setName}
                    />

                    <PrimaText content="Email" weight="600" size={14} color="#2A2A38" top={16} bottom={6} />
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
                        placeholder="Create a password (min 6 chars)"
                        value={password}
                        secure={!showPassword}
                        isValid={password.length === 0 || passwordValid}
                        validationTxt="Password must be at least 6 characters"
                        onChange={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showRow}>
                        <PrimaText content={showPassword ? 'Hide' : 'Show'} size={12} color="#888" />
                    </TouchableOpacity>

                    <PrimaText content="Confirm Password" weight="600" size={14} color="#2A2A38" top={12} bottom={6} />
                    <PrimaInput
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        secure={!showConfirm}
                        isValid={confirmPassword.length === 0 || confirmValid}
                        validationTxt="Passwords do not match"
                        onChange={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.showRow}>
                        <PrimaText content={showConfirm ? 'Hide' : 'Show'} size={12} color="#888" />
                    </TouchableOpacity>

                    <View style={styles.row}>
                        <PrimaText content="Already have an account?" size={13} color="#777D88" />
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <PrimaText content=" Login" size={13} weight="700" color="#0A5CC1" />
                        </TouchableOpacity>
                    </View>
                </View>

                <PrimaButton
                    content="SIGN UP"
                    width="100%"
                    height={56}
                    radius={10}
                    bottom={30}
                    opacity={canSubmit ? 1 : 0.5}
                    weight="700"
                    size={16}
                    color="#2A2A38"
                    isLoading={isSignupLoading}
                    onPress={handleSignup}
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
    showRow: { alignSelf: 'flex-end', marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
});

export default SignupPage;
