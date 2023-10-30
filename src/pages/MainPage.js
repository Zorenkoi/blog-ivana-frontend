import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { openLogInModal, openSignInModal } from '../redux/slices/modalReducer'

const MainPage = () => {
  const dispatch = useDispatch()

  return (
    <>
      <h1 className='title'>home</h1>
      <button className='button' onClick={() => dispatch(openLogInModal())}>
        Registration Modal
      </button>
      <button className='button' onClick={() => dispatch(openSignInModal())}>
        Subscribe Modal
      </button>
    </>
  )
}

export default MainPage
