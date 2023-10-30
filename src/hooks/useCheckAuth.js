import { useSelector } from 'react-redux'

export const useCheckAuth = () => {
  if (localStorage.getItem('token')) {
  }
  return useSelector((state) => state.userReducer.isLogin)
}
