import Axios from "axios";
import * as Types from "./Types";
import { rootUrl } from "../../assets/functions/env";
import { storeData } from "../../assets/functions/helperFunction";
import { showToast } from "../../assets/utils/ToastHelper";

export const UpdateProfile = ({ name, phone, avatarBase64 }, onSuccess) => (dispatch) => {
    const url = `${rootUrl}user/profile`;
    dispatch({ type: Types.IS_PROFILE_LOADING, payload: true });

    const payload = {};
    if (name) payload.name = name;
    if (phone !== undefined) payload.phone = phone;
    if (avatarBase64) payload.avatarBase64 = avatarBase64;

    Axios.put(url, payload)
        .then((res) => {
            const { success, message, data } = res.data;
            if (success) {
                storeData("user", data);
                dispatch({ type: Types.SET_USER, payload: data });
                dispatch({ type: Types.PROFILE_UPDATE_SUCCESS, payload: true });
                showToast("success", message || "Profile updated successfully");
                if (onSuccess) onSuccess();
            } else {
                showToast("error", message || "Failed to update profile");
            }
            dispatch({ type: Types.IS_PROFILE_LOADING, payload: false });
        })
        .catch((err) => {
            const message = err?.response?.data?.message || "Failed to update profile";
            showToast("error", message);
            dispatch({ type: Types.IS_PROFILE_LOADING, payload: false });
        });
};

export const FalseProfileUpdateSuccess = () => (dispatch) => {
    dispatch({ type: Types.PROFILE_UPDATE_SUCCESS, payload: false });
};
