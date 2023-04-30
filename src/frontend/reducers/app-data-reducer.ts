import {createAction, createSlice} from "@reduxjs/toolkit";
import {createTransform, persistReducer} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Notifications } from "aws-amplify";

const transform = createTransform(
    (incomingState, key) => {
        if (Object.keys(incomingState).length > 0){
            Object.keys(incomingState).forEach((key) => {
                if (typeof incomingState[key] === 'object' && "allergens" in incomingState[key]){
                    incomingState[key].allergens = [...incomingState[key].allergens] // convert to array
                }
            })
        }
        return {...incomingState}
    },
    (outgoingState, key) => {
        if (Object.keys(outgoingState).length > 0){
            Object.keys(outgoingState).forEach((key) => {
                if (typeof outgoingState[key] === 'object' && "allergens" in outgoingState[key]) {
                    outgoingState[key].allergens = new Set(outgoingState[key].allergens) // convert back to set
                }
            })
        }
        return outgoingState
    },
    {}
)

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    transforms: [transform],
}

const initialState = {
    accounts: {}, // will contain selection of allergies, and hasCompletedSetup
}


export const createAccount = createAction<object>("storage/create_account");
export const updateAccounts = createAction<object>("storage/update_accounts");
export const deleteAccount = createAction<string>("storage/delete_account");
export const updateProductNotificationStatus = createAction<object>("storage/update_product_notification_status");
export const updateAllergens = createAction<object>("storage/update_allergens");
export const updateScans = createAction<object>("storage/update_scans");
export const setHasCompletedSetup = createAction<string>("storage/set_has_completed_setup") // takes username
export const addNotification = createAction<object>("storage/add_notification");
export const openNotification = createAction<object>("storage/set_is_opened");
export const deleteNotification = createAction<object>("storage/delete_notification");

export const AppDataSlice = createSlice({
   name: "storage",
   initialState, 
   reducers: {
       create_account(state, action) {
           const username = action.payload.username;
           if (!(username in state.accounts)) {
               state.accounts[username] = {
                   allergens: new Set(),
                   scans: {},
                   hasCompletedSetup: false,
                   notifications: []
               }
           }
       },
       update_accounts(state, action) {
           const username = action.payload.username;
           const accountData = action.payload.data;
           state.accounts[username] = {...state.accounts[username], ...accountData}
       },
       delete_account(state, action) {
            const username = action.payload;
            state.accounts[username] = {};
            delete state.accounts[username];
        },
       update_allergens(state, action) {

           const username = action.payload.username;
           const allergens = action.payload.allergens;

           state.accounts[username].allergens = new Set(allergens);
       },
       update_scans(state, action) {
            const username = action.payload.username;
            const barcode = Object.keys(action.payload.scan)[0];
            const scanInfo = action.payload.scan[barcode];
            state.accounts[username].scans[barcode] = scanInfo;
       },
       update_product_notification_status(state, action){
            const username = action.payload.username;
            const product_id = action.payload.product_id;
            const notifications_boolean = action.payload.product_notifications_boolean;
            if (state.accounts[username].scans[product_id]) {
                state.accounts[username].scans[product_id].receive_notifications = notifications_boolean;
            }
       },
       set_has_completed_setup(state, action) {
           const username = action.payload;

           state.accounts[username].hasCompletedSetup = true;
       },
       add_notification(state, action) {
           const username = action.payload.username;
           const payloadData = JSON.parse(action.payload.notificationData);
           const date = action.payload.date;
           const productID = payloadData.product_id;
           const productName = payloadData.product_name;
           const suspectedAllergens = payloadData.report.suspected_allergens;
           const reporterID = payloadData.report.user_id;
           if (!("notifications" in state.accounts[username])) {
               state.accounts[username].notifications = [];
           }
           let isDuplicate = false;
           state.accounts[username].notifications.forEach((noti) => {
               if ((reporterID === noti.reporterID) && (productID === noti.productID)){
                   isDuplicate = true;
               }
           })
           if (!isDuplicate) {
               state.accounts[username].notifications = [...state.accounts[username].notifications, {productID: productID, productName: productName, suspectedAllergens: suspectedAllergens, reporterID: reporterID, isOpened: false, date: date}];
           }
           
        },
       delete_notification(state, action) {
           const username = action.payload.username;
           const productId = action.payload.productId;
           let myIndex = -1;
           state.accounts[username].notifications?.map((noti, index) => {
                if ((noti.productID === productId) && (noti.reporterID === username)){
                    myIndex = index;
                }
           })

           if (myIndex !== -1){
            state.accounts[username].notifications.splice(myIndex, 1);
           }
       },
    //    delete_report(state, action){
    //         const username = action.payload.username;
    //         const indx = action.payload.indx;
    //         state.accounts.username
    //    },
       set_is_opened(state, action) {
           const username = action.payload.username;
           const productID = action.payload.productID;

           // find notification index of product id
           const index = [...state.accounts[username].notifications].findIndex(obj => obj.productID === productID);

           state.accounts[username].notifications[index] = {...state.accounts[username].notifications[index], isOpened: true};
       }
   }
});

export const appData = persistReducer(persistConfig, AppDataSlice.reducer);
