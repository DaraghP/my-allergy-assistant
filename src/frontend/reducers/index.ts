import {appData} from "./app-data-reducer";
import user from "./user-reducer";
import {combineReducers} from "@reduxjs/toolkit";

const reducers = combineReducers({
    appData: appData,
    user: user
});

export default reducers;