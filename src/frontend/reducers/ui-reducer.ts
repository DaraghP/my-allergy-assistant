import {createAction, createSlice} from "@reduxjs/toolkit";
import { ScanMode } from "../components/Scanner";

// current account used
const initialState = {
    scanMode: ScanMode.Detect,
    didSearch: false,
    loading: false,
    currentPage: 1
}

export const updateScanMode = createAction<string>("ui/update_scan_mode");
export const updateDidSearch = createAction("ui/update_did_search");
export const updateLoadingState = createAction("ui/update_loading_state");
export const updateCurrentPage = createAction<number>("ui/update_current_page");

export const UISlice = createSlice({
   name: "ui",
   initialState,
   reducers: {
       update_scan_mode(state, action) {
            state.scanMode = action.payload;
       },
       update_did_search(state) {
            state.didSearch = true;
       },
       update_loading_state(state) {
            state.loading = !state.loading;
       },
       update_current_page(state, action) {
            state.currentPage = action.payload;
       }
   }
});

export default UISlice.reducer;