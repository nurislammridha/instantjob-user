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
import { FalsePasswordResetSuccess, SubmitSetNewPassword, FalseLoginSubmitted } from '../redux/_redux/AuthAction';

const SetNewPasswordPage = ({ navigation }) => {
    const dispatch = useDispatch();
    const { isSetPasswordLoading, passwordResetSuccess, resetToken, loginSubmitted } =
        useSelector((state) => state.auth);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const passwordValid = password.length >= 6;
    const confirmValid = confirmPassword === password && confirmPassword.length >= 6;
    const canSubmit = passwordValid && confirmValid && !!resetToken;

    useEffect(() => {
        if (passwordResetSuccess) {
            dispatch(FalsePasswordResetSuccess());
        }
        if (loginSubmitted) {
            dispatch(FalseLoginSubmitted());
            navigation.replace('Home');
        }
    }, [passwordResetSuccess, loginSubmitted]);

    const handleSubmit = () => {
        if (!canSubmit || isSetPasswordLoading) return;
        dispatch(SubmitSetNewPassword({ resetToken, password, confirmPassword }));
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.top}>
                    <PrimaText content="Set New Password" weight="700" size={26} color="#2A2A38" top={40} />
                    <PrimaText
                        content="Create a strong new password for your account."
                        weight="400"
                        size={14}
                        color="#777D88"
                        top={8}
                        bottom={30}
                    />

                    <PrimaText content="New Password" weight="600" size={14} color="#2A2A38" bottom={6} />
                    <PrimaInput
                        placeholder="Enter new password (min 6 chars)"
                        value={password}
                        secure={!showPassword}
                        isValid={password.length === 0 || passwordValid}
                        validationTxt="Password must be at least 6 characters"
                        onChange={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showRow}>
                        <PrimaText content={showPassword ? 'Hide' : 'Show'} size={12} color="#888" />
                    </TouchableOpacity>

                    <PrimaText content="Confirm Password" weight="600" size={14} color="#2A2A38" top={16} bottom={6} />
                    <PrimaInput
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        secure={!showConfirm}
                        isValid={confirmPassword.length === 0 || confirmValid}
                        validationTxt="Passwords do not match"
                        onChange={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.showRow}>
                        <PrimaText content={showConfirm ? 'Hide' : 'Show'} size={12} color="#888" />
                    </TouchableOpacity>
                </View>

                <PrimaButton
                    content="Update Password"
                    width="100%"
                    height={56}
                    radius={10}
                    bottom={30}
                    opacity={canSubmit ? 1 : 0.5}
                    weight="700"
                    size={16}
                    color="#2A2A38"
                    isLoading={isSetPasswordLoading}
                    onPress={handleSubmit}
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
});

export default SetNewPasswordPage;
