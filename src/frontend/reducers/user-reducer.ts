import {createAction, createSlice} from "@reduxjs/toolkit";

// current account used
const initialState = {
    username: ""
}

export const updateUsername = createAction<string>("user/update_username");

export const UserSlice = createSlice({
   name: "user",
   initialState,
   reducers: {
       update_username(state, action) {
           // console.log(action.payload)
           state.username = action.payload;
       }
   }
});

export default UserSlice.reducer;