import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isOpen: false,
  modalBodyName: null,
}

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openSignInModal: () => {
      return {
        isOpen: true,
        modalBodyName: 'signinmodal',
      }
    },
    openLogInModal: () => {
      return {
        isOpen: true,
        modalBodyName: 'loginmodal',
      }
    },
    openLogOutModal: () => {
      return {
        isOpen: true,
        modalBodyName: 'logoutmodal',
      }
    },
    closeModal: (state) => {
      return {
        ...state,
        isOpen: false,
      }
    },
  },
})

const modalReducer = modalSlice.reducer

export const { closeModal, openSignInModal, openLogInModal, openLogOutModal } =
  modalSlice.actions

export default modalReducer
