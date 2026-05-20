import * as Types from "./Types";

const initialState = {
    isCategoriesLoading: false,
    categories: [],
};

const CategoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case Types.IS_CATEGORIES_LOADING:
            return { ...state, isCategoriesLoading: action.payload };
        case Types.SET_CATEGORIES:
            return { ...state, categories: action.payload };
        default:
            return state;
    }
};

export default CategoryReducer;
