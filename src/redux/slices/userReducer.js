import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userName: null,
  userId: null,
  isLogin: false,
}

export const userSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    login: (state, action) => {
      const { userId, userName } = action.payload
      return {
        isLogin: true,
        userId,
        userName,
      }
    },
    logout: () => {
      return initialState
    },
  },
})

const userReducer = userSlice.reducer

export const { login, logout } = userSlice.actions

export default userReducer
