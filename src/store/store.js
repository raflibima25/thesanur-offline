// store/store.js
import { createStore } from "redux";
import { authReducer } from "../features/auth/authSlice";

export const store = createStore(authReducer);
