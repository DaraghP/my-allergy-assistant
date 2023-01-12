import { configureStore } from "@reduxjs/toolkit";
import reducers from "./reducers";
import {persistStore} from "redux-persist";
import thunk from "redux-thunk";

export const store = configureStore({
    reducer: reducers,
    middleware: [thunk],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store)