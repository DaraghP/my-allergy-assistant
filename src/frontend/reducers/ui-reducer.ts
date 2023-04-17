import {createAction, createSlice} from "@reduxjs/toolkit";
import { ScanMode } from "../components/scan/Scanner";

// current account used
const initialState = {
    scanMode: ScanMode.Detect,
    scanResult: {},
    didSearch: false,
    loading: false,
    currentPage: 1
}

export const updateScanMode = createAction<string>("ui/update_scan_mode");
export const updateDidSearch = createAction("ui/update_did_search");
export const updateLoadingState = createAction<boolean>("ui/update_loading_state");
export const updateCurrentPage = createAction<number>("ui/update_current_page");
export const updateScanResult = createAction<object>("ui/update_scan_result");

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
       update_loading_state(state, action) {
            state.loading = action.payload;
       },
       update_current_page(state, action) {
            state.currentPage = action.payload;
       },
       update_scan_result(state, action) {
            state.scanResult = action.payload;
       }
   }
});

export default UISlice.reducer;