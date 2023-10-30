import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userReducer'
import modalReducer from './slices/modalReducer'
import { localStorageMiddleware } from '../helper/LocalStorageMiddleware'

const persistedState = JSON.parse(localStorage.getItem('reduxState')) || {}

export const store = configureStore({
  reducer: { userReducer, modalReducer },
  preloadedState: persistedState,
  middleware: [localStorageMiddleware],
})
