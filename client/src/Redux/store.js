import { version } from "react";
import { applyMiddleware, combineReducers, createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage'
import { productListReducer, productReducer } from "./Reducers/Product";
import { thunk } from "redux-thunk";
import { userAdminToggleReducer, userListReducer, userLoginReducer, userRegisterReducer, userProfileUpdateReducer, passwordResetReducer, verificationCodeReducer } from "./Reducers/User";
import { orderDetailReducer, orderListReducer } from "./Reducers/Order";

const persistConfig = {
   key: 'root',
   storage,
   version: 1,
}

const rootReducer = combineReducers({
   productListReducer,
   productReducer,
   userLoginReducer,
   userRegisterReducer,
   userProfileUpdateReducer,
   passwordResetReducer,
   userListReducer,
   userAdminToggleReducer,
   orderListReducer,
   orderDetailReducer,
   verificationCodeReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer, applyMiddleware(thunk))

export let persistor = persistStore(store)