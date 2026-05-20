import * as Types from "./Types";

const initialState = {
    // signup
    isSignupLoading: false,
    signupSubmitted: false,

    // otp (signup)
    isOtpLoading: false,
    otpVerified: false,

    // resend otp
    isResendOtpLoading: false,

    // login
    isLoginLoading: false,
    loginSubmitted: false,

    // forgot password
    isForgotPasswordLoading: false,
    forgotPasswordSubmitted: false,

    // forgot otp
    isForgotOtpLoading: false,
    forgotOtpVerified: false,
    resetToken: null,

    // set new password
    isSetPasswordLoading: false,
    passwordResetSuccess: false,

    // profile
    isProfileLoading: false,
    profileUpdateSuccess: false,

    // user state
    user: null,
    pendingEmail: null, // email waiting for OTP verification
};

const AuthReducer = (state = initialState, action) => {
    switch (action.type) {
        case Types.IS_SIGNUP_LOADING:
            return { ...state, isSignupLoading: action.payload };
        case Types.SIGNUP_SUBMITTED:
            return { ...state, signupSubmitted: action.payload };

        case Types.IS_OTP_LOADING:
            return { ...state, isOtpLoading: action.payload };
        case Types.OTP_VERIFIED:
            return { ...state, otpVerified: action.payload };

        case Types.IS_RESEND_OTP_LOADING:
            return { ...state, isResendOtpLoading: action.payload };

        case Types.IS_LOGIN_LOADING:
            return { ...state, isLoginLoading: action.payload };
        case Types.LOGIN_SUBMITTED:
            return { ...state, loginSubmitted: action.payload };

        case Types.IS_FORGOT_PASSWORD_LOADING:
            return { ...state, isForgotPasswordLoading: action.payload };
        case Types.FORGOT_PASSWORD_SUBMITTED:
            return { ...state, forgotPasswordSubmitted: action.payload };

        case Types.IS_FORGOT_OTP_LOADING:
            return { ...state, isForgotOtpLoading: action.payload };
        case Types.FORGOT_OTP_VERIFIED:
            return { ...state, forgotOtpVerified: action.payload };
        case Types.RESET_TOKEN:
            return { ...state, resetToken: action.payload };

        case Types.IS_SET_PASSWORD_LOADING:
            return { ...state, isSetPasswordLoading: action.payload };
        case Types.PASSWORD_RESET_SUCCESS:
            return { ...state, passwordResetSuccess: action.payload };

        case Types.IS_PROFILE_LOADING:
            return { ...state, isProfileLoading: action.payload };
        case Types.PROFILE_UPDATE_SUCCESS:
            return { ...state, profileUpdateSuccess: action.payload };

        case Types.SET_USER:
            return { ...state, user: action.payload };
        case Types.SET_PENDING_EMAIL:
            return { ...state, pendingEmail: action.payload };

        case Types.LOGOUT:
            return {
                ...initialState,
                user: null,
                loginSubmitted: false,
            };

        default:
            return state;
    }
};

export default AuthReducer;
