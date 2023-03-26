import {appData} from "./app-data-reducer";
import user from "./user-reducer";
import ui from "./ui-reducer";
import {combineReducers} from "@reduxjs/toolkit";

const reducers = combineReducers({
    appData: appData,
    user: user,
    ui: ui    
});

export default reducers;