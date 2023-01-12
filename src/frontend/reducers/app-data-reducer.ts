import {createAction, createSlice} from "@reduxjs/toolkit";
import {createTransform, persistReducer} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    transforms: [transform]
}

const initialState = {
    accounts: {}, // will contain selection of allergies, and hasCompletedSetup
}

export const createAccount = createAction<object>("storage/create_account");
export const updateAccounts = createAction<object>("storage/update_accounts");
export const updateAllergens = createAction<object>("storage/update_allergens");
export const setHasCompletedSetup = createAction<string>("storage/set_has_completed_setup") // takes username

export const AppDataSlice = createSlice({
   name: "storage",
   initialState,
   reducers: {
       create_account(state, action) {
           state.accounts[action.payload.username] = {
               allergens: new Set(),
               hasCompletedSetup: false
           }
       },
       update_accounts(state, action) {
           state.accounts = {...state.accounts, ...action.payload}
       },
       update_allergens(state, action) {

           const username = action.payload.username;
           const allergens = action.payload.allergens;

           state.accounts[username].allergens = new Set(allergens);
       },
       set_has_completed_setup(state, action) {
           const username = action.payload;

           state.accounts[username].hasCompletedSetup = true;
       }
   }
});

export const appData = persistReducer(persistConfig, AppDataSlice.reducer);
