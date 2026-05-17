import Axios from "axios";
import * as Types from "./Types";
import { rootUrl } from "../../assets/functions/env";
import { storeData, removeData } from "../../assets/functions/helperFunction";
import { showToast } from "../../assets/utils/ToastHelper";

// ─── Signup ───────────────────────────────────────────────────────────────────

export const SubmitSignup = ({ name, email, password, confirmPassword }) => (dispatch) => {
    const url = `${rootUrl}auth/signup`;
    console.log('[SIGNUP] hitting URL:', url);
    console.log('[SIGNUP] payload:', { name, email, password: '***', confirmPassword: '***' });
    dispatch({ type: Types.IS_SIGNUP_LOADING, payload: true });
    Axios.post(url, { name, email, password, confirmPassword })
        .then((res) => {
            console.log('[SIGNUP] response status:', res.status);
            console.log('[SIGNUP] response data:', res.data);
            const { success, message } = res.data;
            if (success) {
                dispatch({ type: Types.SET_PENDING_EMAIL, payload: email });
                dispatch({ type: Types.SIGNUP_SUBMITTED, payload: true });
                showToast("success", message);
            } else {
                showToast("error", message);
            }
            dispatch({ type: Types.IS_SIGNUP_LOADING, payload: false });
        })
        .catch((err) => {
            console.log('[SIGNUP] error type:', err?.code);
            console.log('[SIGNUP] error message:', err?.message);
            console.log('[SIGNUP] response status:', err?.response?.status);
            console.log('[SIGNUP] response data:', err?.response?.data);
            console.log('[SIGNUP] request config URL:', err?.config?.url);
            const message = err?.response?.data?.message || err.message || "Signup failed";
            showToast("error", message);
            dispatch({ type: Types.IS_SIGNUP_LOADING, payload: false });
        });
};
export const FalseSignupSubmitted = () => (dispatch) => {
    dispatch({ type: Types.SIGNUP_SUBMITTED, payload: false });
};

// ─── Verify Signup OTP ────────────────────────────────────────────────────────

export const VerifySignupOtp = ({ email, otp }) => (dispatch) => {
    const url = `${rootUrl}auth/verify-signup-otp`;
    dispatch({ type: Types.IS_OTP_LOADING, payload: true });
    Axios.post(url, { email, otp: otp.join("") })
        .then((res) => {
            const { success, message, data } = res.data;
            if (success) {
                storeData("access_token", data.token);
                storeData("user", data.user);
                storeData("isLogin", true);
                dispatch({ type: Types.SET_USER, payload: data.user });
                dispatch({ type: Types.OTP_VERIFIED, payload: true });
                dispatch({ type: Types.LOGIN_SUBMITTED, payload: true });
                showToast("success", message);
            } else {
                showToast("error", message);
            }
            dispatch({ type: Types.IS_OTP_LOADING, payload: false });
        })
        .catch((err) => {
            const message = err?.response?.data?.message || err.message || "OTP verification failed";
            showToast("error", message);
            dispatch({ type: Types.IS_OTP_LOADING, payload: false });
        });
};
export const FalseOtpVerified = () => (dispatch) => {
    dispatch({ type: Types.OTP_VERIFIED, payload: false });
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export const ResendOtp = ({ email, purpose }) => (dispatch) => {
    const url = `${rootUrl}auth/resend-otp`;
    dispatch({ type: Types.IS_RESEND_OTP_LOADING, payload: true });
    Axios.post(url, { email, purpose })
        .then((res) => {
            const { success, message } = res.data;
            if (success) {
                showToast("success", message);
            } else {
                showToast("error", message);
            }
            dispatch({ type: Types.IS_RESEND_OTP_LOADING, payload: false });
        })
        .catch((err) => {
            const message = err?.response?.data?.message || err.message || "Failed to resend OTP";
            showToast("error", message);
            dispatch({ type: Types.IS_RESEND_OTP_LOADING, payload: false });
        });
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const SubmitLogin = ({ email, password }) => (dispatch) => {
    const url = `${rootUrl}auth/login`;
    dispatch({ type: Types.IS_LOGIN_LOADING, payload: true });
    Axios.post(url, { email, password })
        .then((res) => {
            const { success, message, data } = res.data;
            if (success) {
                storeData("access_token", data.token);
                storeData("user", data.user);
                storeData("isLogin", true);
                dispatch({ type: Types.SET_USER, payload: data.user });
                dispatch({ type: Types.LOGIN_SUBMITTED, payload: true });
                showToast("success", message);
            } else {
                showToast("error", message);
            }
            dispatch({ type: Types.IS_LOGIN_LOADING, payload: false });
        })
        .catch((err) => {
            const message = err?.response?.data?.message || err.message || "Login failed";
            showToast("error", message);
            dispatch({ type: Types.IS_LOGIN_LOADING, payload: false });
        });
};
export const FalseLoginSubmitted = () => (dispatch) => {
    dispatch({ type: Types.LOGIN_SUBMITTED, payload: false });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const SubmitForgotPassword = ({ email }) => (dispatch) => {
    const url = `${rootUrl}auth/forgot-password`;
    dispatch({ type: Types.IS_FORGOT_PASSWORD_LOADING, payload: true });
    Axios.post(url, { email })
        .then((res) => {
            const { success, message } = res.data;
            if (success) {
                dispatch({ type: Types.SET_PENDING_EMAIL, payload: email });
                dispatch({ type: Types.FORGOT_PASSWORD_SUBMITTED, payload: true });
                showToast("success", message);
            } else {
                showToast("error", message);
            }
            dispatch({ type: Types.IS_FORGOT_PASSWORD_LOADING, payload: false });
        })
        .catch((err) => {
            const message = err?.response?.data?.message || err.message || "Failed to send OTP";
            showToast("error", message);
            dispatch({ type: Types.IS_FORGOT_PASSWORD_LOADING, payload: false });
        });
};
export const FalseForgotPasswordSubmitted = () => (dispatch) => {
    dispatch({ type: Types.FORGOT_PASSWORD_SUBMITTED, payload: false });
};

// ─── Verify Forgot Password OTP ───────────────────────────────────────────────

export const VerifyForgotOtp = ({ email, otp }) => (dispatch) => {
    const url = `${rootUrl}auth/verify-forgot-otp`;
    dispatch({ type: Types.IS_FORGOT_OTP_LOADING, payload: true });
    Axios.post(url, { email, otp: otp.join("") })
        .then((res) => {
            const { success, message, data } = res.data;
            if (success) {
                dispatch({ type: Types.RESET_TOKEN, payload: data.resetToken });
                dispatch({ type: Types.FORGOT_OTP_VERIFIED, payload: true });
                showToast("success", message);
            } else {
                showToast("error", message);
            }
            dispatch({ type: Types.IS_FORGOT_OTP_LOADING, payload: false });
        })
        .catch((err) => {
            const message = err?.response?.data?.message || err.message || "OTP verification failed";
            showToast("error", message);
            dispatch({ type: Types.IS_FORGOT_OTP_LOADING, payload: false });
        });
};
export const FalseForgotOtpVerified = () => (dispatch) => {
    dispatch({ type: Types.FORGOT_OTP_VERIFIED, payload: false });
};

// ─── Set New Password ─────────────────────────────────────────────────────────

export const SubmitSetNewPassword = ({ resetToken, password, confirmPassword }) => (dispatch) => {
    const url = `${rootUrl}auth/set-new-password`;
    dispatch({ type: Types.IS_SET_PASSWORD_LOADING, payload: true });
    Axios.post(url, { resetToken, password, confirmPassword })
        .then((res) => {
            const { success, message, data } = res.data;
            if (success) {
                storeData("access_token", data.token);
                storeData("user", data.user);
                storeData("isLogin", true);
                dispatch({ type: Types.SET_USER, payload: data.user });
                dispatch({ type: Types.RESET_TOKEN, payload: null });
                dispatch({ type: Types.PASSWORD_RESET_SUCCESS, payload: true });
                dispatch({ type: Types.LOGIN_SUBMITTED, payload: true });
                showToast("success", message);
            } else {
                showToast("error", message);
            }
            dispatch({ type: Types.IS_SET_PASSWORD_LOADING, payload: false });
        })
        .catch((err) => {
            const message = err?.response?.data?.message || err.message || "Failed to set new password";
            showToast("error", message);
            dispatch({ type: Types.IS_SET_PASSWORD_LOADING, payload: false });
        });
};
export const FalsePasswordResetSuccess = () => (dispatch) => {
    dispatch({ type: Types.PASSWORD_RESET_SUCCESS, payload: false });
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const Logout = () => async (dispatch) => {
    await removeData("access_token");
    await removeData("user");
    await removeData("isLogin");
    dispatch({ type: Types.LOGOUT });
};
