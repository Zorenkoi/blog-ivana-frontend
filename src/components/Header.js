import { Link, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../redux/slices/userReducer'
import { useCheckAuth } from '../hooks/useCheckAuth'
import {
  openLogInModal,
  openSignInModal,
  openLogOutModal,
} from '../redux/slices/modalReducer'

import logoutimg from '../images/logout.png'
import enterimg from '../images/enter.png'
import '../styles/Header.css'

const Header = () => {
  const history = useHistory()
  const isLogin = useCheckAuth()
  const dispatch = useDispatch()

  const clickLogout = (e) => {
    e.preventDefault()
    dispatch(openLogOutModal())
  }
  const clickLogin = (e) => {
    e.preventDefault()
    dispatch(openLogInModal())
  }
  const clickSignin = (e) => {
    e.preventDefault()
    dispatch(openSignInModal())
  }

  return (
    <header className='header'>
      <div className='header-wrapper'>
        <div className='header-body'>
          <div className='header-left'>
            <Link to='/' className='header-link'>
              Головна
            </Link>

            {isLogin ? (
              <Link to='/createarticle' className='header-link'>
                Створити статтю
              </Link>
            ) : null}
          </div>

          {/* ////////////////////////////////////////////// */}

          <div className='header-right'>
            {isLogin ? (
              <HeaderButton
                text={'Вийти'}
                click={clickLogout}
                img={logoutimg}
              />
            ) : (
              <>
                <HeaderButton
                  text={'Зареєструватися'}
                  click={clickSignin}
                  img={null}
                />
                <HeaderButton
                  text={'Увійти'}
                  click={clickLogin}
                  img={enterimg}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

const HeaderButton = ({ text, click, img }) => {
  return (
    <>
      <div onClick={click} className='header-button'>
        <div className='header-button-text'>{text}</div>
        {img ? (
          <div className='header-button-img-wrapper'>
            <img src={img} alt={text} className='img' />
          </div>
        ) : null}
      </div>
    </>
  )
}

export default Header
