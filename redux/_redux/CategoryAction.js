import Axios from "axios";
import * as Types from "./Types";
import { rootUrl } from "../../assets/functions/env";

export const FetchCategories = ({ limit = 9 } = {}) => (dispatch) => {
    const url = `${rootUrl}category?limit=${limit}&isActive=true`;
    dispatch({ type: Types.IS_CATEGORIES_LOADING, payload: true });
    Axios.get(url)
        .then((res) => {
            const { status, result } = res.data;
            if (status) {
                dispatch({ type: Types.SET_CATEGORIES, payload: result });
            }
            dispatch({ type: Types.IS_CATEGORIES_LOADING, payload: false });
        })
        .catch(() => {
            dispatch({ type: Types.IS_CATEGORIES_LOADING, payload: false });
        });
};

export const FetchAllCategories = () => (dispatch) => {
    const url = `${rootUrl}category?limit=100&isActive=true`;
    dispatch({ type: Types.IS_CATEGORIES_LOADING, payload: true });
    Axios.get(url)
        .then((res) => {
            const { status, result } = res.data;
            if (status) {
                dispatch({ type: Types.SET_CATEGORIES, payload: result });
            }
            dispatch({ type: Types.IS_CATEGORIES_LOADING, payload: false });
        })
        .catch(() => {
            dispatch({ type: Types.IS_CATEGORIES_LOADING, payload: false });
        });
};
