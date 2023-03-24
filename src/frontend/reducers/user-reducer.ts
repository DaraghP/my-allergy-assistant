import {createAction, createSlice} from "@reduxjs/toolkit";

// current account used
const initialState = {
    username: "",
    email: "",
    deviceEndpoint: ""
}

export const updateUsername = createAction<string>("user/update_username");
export const updateEmail = createAction<string>("user/update_email");
export const updateDeviceEndpoint = createAction<string>("user/update_device_endpoint");

export const UserSlice = createSlice({
   name: "user",
   initialState,
   reducers: {
       update_username(state, action) {
           state.username = action.payload;
       },
       update_email(state, action) {
           state.email = action.payload;
       },
       update_device_endpoint(state, action) {
           state.deviceEndpoint = action.payload;
       }
   }
});

export default UserSlice.reducer;