import { combineReducers } from 'redux';
import AuthReducer from './_redux/AuthReducer';
import CategoryReducer from './_redux/CategoryReducer';

const rootReducer = combineReducers({
    auth: AuthReducer,
    category: CategoryReducer,
});

export default rootReducer;
