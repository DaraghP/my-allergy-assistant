import {createAction, createSlice} from "@reduxjs/toolkit";

// current account used
const initialState = {
    username: "",
    email: ""
}

export const updateUsername = createAction<string>("user/update_username");
export const updateEmail = createAction<string>("user/update_email");

export const UserSlice = createSlice({
   name: "user",
   initialState,
   reducers: {
       update_username(state, action) {
           state.username = action.payload;
       },
       update_email(state, action) {
           state.email = action.payload;
       }
   }
});

export default UserSlice.reducer;