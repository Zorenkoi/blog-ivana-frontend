import errorImg from '../images/error.png'

const Error = () => {
  return (
    <div className='error-wrapper'>
      <div className='error-img-container'>
        <img src={errorImg} alt='spiner' className='img' />
      </div>
      <div className='error-text'>
        Сталася помилка
        <br />
        Перевірте підключення до мережі
        <br />
        Та перезагрузіть сайт
      </div>
    </div>
  )
}

export default Error
