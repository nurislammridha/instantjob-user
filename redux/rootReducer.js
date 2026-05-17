import { combineReducers } from 'redux';
import AuthReducer from './_redux/AuthReducer';

const rootReducer = combineReducers({
    auth: AuthReducer,
});

export default rootReducer;
