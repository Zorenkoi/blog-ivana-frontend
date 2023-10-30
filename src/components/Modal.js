import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import axios from '../axios.js'

import { closeModal } from '../redux/slices/modalReducer'
import { login, logout } from '../redux/slices/userReducer'

import { useCheckAuth } from '../hooks/useCheckAuth'
import useLoginForm from '../hooks/useLoginForm'

import Loading from './Loading.js'

import '../styles/Modal.css'

const Modal = () => {
  const dispatch = useDispatch()
  const { isOpen, modalBodyName } = useSelector((state) => state.modalReducer)

  const getCN = (className) => {
    return isOpen ? className + ' active' : className
  }
  const clickModal = () => {
    dispatch(closeModal())
  }

  const getModalBody = (modalBodyName) => {
    switch (modalBodyName) {
      case 'signinmodal':
        return <SignInModal />

      case 'loginmodal':
        return <LogInModal />

      case 'logoutmodal':
        return <LogOutModal />

      default:
        break
    }
  }

  return (
    <div className={getCN('modal')} onClick={clickModal}>
      <div
        className={getCN('modal-body')}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {modalBodyName ? getModalBody(modalBodyName) : null}
      </div>
    </div>
  )
}

const SignInModal = () => {
  const dispatch = useDispatch()
  const [statusModal, setStatusModal] = useState('ok')
  const [modalErrorMessage, setModalErrorMessage] = useState('')
  const { email, password, fullName, changeValue, updateValue } = useLoginForm()

  const checkErrors = () => {
    if (email.errorMessage.length !== 0) return true
    if (password.errorMessage.length !== 0) return true
    if (fullName.errorMessage.length !== 0) return true

    return false
  }

  const clickSubmit = () => {
    if (checkErrors()) {
      setStatusModal('error')
      return
    }
    setStatusModal('loading')

    const payload = {
      email: email.value,
      password: password.value,
      fullName: fullName.value,
    }

    axios
      .post('/auth/registration', payload)
      .then((response) => {
        console.log(response.data)
        const { token, userId, userName } = response.data
        dispatch(login({ userId, userName }))
        saveTokenToLocalStorage(token)

        updateValue()
        setStatusModal('success')
        setTimeout(() => {
          dispatch(closeModal())
        }, 2000)
      })
      .catch((error) => {
        setStatusModal('error')
        setModalErrorMessage('Не правильний email або пароль')
        console.log(error.response.data)
      })
  }

  if (statusModal === 'loading') return <Loading />
  if (statusModal === 'success') {
    return <h1 className='modal-title'>Реєстрація пройшла успішно!</h1>
  }

  return (
    <>
      <h1 className='modal-title mb-20'>Зареєструватися:</h1>
      <div className='modal-error-message mb-10'>{modalErrorMessage}</div>
      <div className='column'>
        <Input
          inputName={'fullName'}
          value={fullName.value}
          onChange={changeValue}
          placeholder={"Повне ім'я:"}
          errorMessage={statusModal === 'error' ? fullName.errorMessage : ''}
        />
        <Input
          inputName={'email'}
          value={email.value}
          onChange={changeValue}
          placeholder={'email'}
          errorMessage={statusModal === 'error' ? email.errorMessage : ''}
        />

        <Input
          inputName={'password'}
          value={password.value}
          onChange={changeValue}
          placeholder={'Пароль:'}
          errorMessage={statusModal === 'error' ? password.errorMessage : ''}
        />

        <button onClick={clickSubmit} className='reg-button'>
          Відправити
        </button>
      </div>
    </>
  )
}
const LogInModal = () => {
  const dispatch = useDispatch()
  const [statusModal, setStatusModal] = useState('ok')
  const [modalErrorMessage, setModalErrorMessage] = useState('')
  const { email, password, changeValue, updateValue } = useLoginForm()

  const checkErrors = () => {
    if (email.errorMessage.length !== 0) return true
    if (password.errorMessage.length !== 0) return true

    return false
  }

  const clickSubmit = () => {
    if (checkErrors()) {
      setStatusModal('error')
      return
    }
    setStatusModal('loading')

    const payload = {
      email: email.value,
      password: password.value,
    }

    axios
      .post('/auth/login', payload)
      .then((response) => {
        console.log(response.data)
        const { token, userId, userName } = response.data
        dispatch(login({ userId, userName }))
        saveTokenToLocalStorage(token)

        updateValue()
        setStatusModal('success')
        setTimeout(() => {
          dispatch(closeModal())
        }, 2000)
      })
      .catch((error) => {
        setStatusModal('error')
        setModalErrorMessage('Не правильний email або пароль')
        console.log(error.response.data)
      })
  }

  if (statusModal === 'loading') return <Loading />
  if (statusModal === 'success') {
    return <h1 className='modal-title'>Ви успішно увійшли!</h1>
  }

  return (
    <>
      <h1 className='modal-title mb-20'>Увійти:</h1>
      <div className='modal-error-message mb-10'>{modalErrorMessage}</div>
      <div className='column'>
        <Input
          inputName={'email'}
          value={email.value}
          onChange={changeValue}
          placeholder={'email'}
          errorMessage={statusModal === 'error' ? email.errorMessage : ''}
        />

        <Input
          inputName={'password'}
          value={password.value}
          onChange={changeValue}
          placeholder={'Пароль:'}
          errorMessage={statusModal === 'error' ? password.errorMessage : ''}
        />

        <button onClick={clickSubmit} className='reg-button'>
          Відправити
        </button>
      </div>
    </>
  )
}

// const LogInModal2 = () => {
//   const isLogin = useCheckAuth()
//   const history = useHistory()
//   if (isLogin) history.push('/')

//   const dispatch = useDispatch()
//   const [inputValue, setInputValue] = useState({
//     email: '',
//     password: '',
//   })

//   const changeInputValue = (e) => {
//     setInputValue((prevValue) => ({
//       ...prevValue,
//       [e.target.name]: e.target.value,
//     }))
//   }
//   const saveUserData = ({ userId, userName }) => {
//     dispatch(login({ userId, userName }))
//   }

//   const clickSubmit = () => {
//     const payload = inputValue

//     axios
//       .post('/auth/login', payload)
//       .then((response) => {
//         const { token, userId, userName } = response.data

//         saveUserData({ userId, userName })

//         saveTokenToLocalStorage(token)

//         setInputValue({
//           email: '',
//           password: '',
//         })

//         dispatch(closeModal())
//       })
//       .catch((err) => {
//         console.log(err)
//       })
//   }

//   return (
//     <>
//       <h1 className='modal-title mb-20'>Увійти:</h1>
//       <div className='column'>
//         <input
//           onChange={changeInputValue}
//           value={inputValue.email}
//           name='email'
//           type='email'
//           className='input mb-10'
//           placeholder='email:'
//         />
//         <input
//           onChange={changeInputValue}
//           value={inputValue.password}
//           name='password'
//           type='text'
//           className='input mb-10'
//           placeholder='Пароль:'
//         />

//         <button onClick={clickSubmit} className='reg-button'>
//           Відправити
//         </button>
//       </div>
//     </>
//   )
// }
const LogOutModal = () => {
  const dispatch = useDispatch()

  const clickYes = () => {
    window.localStorage.removeItem('token')
    dispatch(logout())

    dispatch(closeModal())
  }
  const clickNo = () => {
    dispatch(closeModal())
  }
  return (
    <>
      <div className='modal-title'>Ви впевнені що</div>
      <div className='modal-title mb-20'>хочете вийти?</div>
      <button onClick={clickYes} className='button mr-10'>
        Так
      </button>
      <button onClick={clickNo} className='button'>
        Ні
      </button>
    </>
  )
}

function saveTokenToLocalStorage(token) {
  window.localStorage.setItem('token', token)
}

const Input = ({ inputName, value, onChange, errorMessage, placeholder }) => {
  const classNameErrorMessage =
    errorMessage.length === 0
      ? 'login-error-message'
      : 'login-error-message active'

  return (
    <div className='login-input-container'>
      <div className={classNameErrorMessage}>{errorMessage}</div>
      <input
        onChange={onChange}
        value={value}
        name={inputName}
        type='text'
        className='input mb-10 full-width'
        placeholder={placeholder}
      />
    </div>
  )
}

export default Modal
