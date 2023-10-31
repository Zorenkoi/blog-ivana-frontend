import '../styles/Hints.css'
const Hints = () => {
  return (
    <div className='hints-wrapper'>
      <div className='hints-header'>підказки</div>
      <ul className='hints-list'>
        <li className='hits-item'>
          Якщо ви бажаєте написати статтю спочатку зареєструйтесь
        </li>
        <li className='hits-item'>
          Ви можете змінювати та видаляти лише ті статті, які написали самі
        </li>
        <li className='hits-item'>
          додайте до своєї статті хоча б одне зображення, так користувачам буде
          легше знаходити та запам'ятовувати вашу статтю
        </li>
        <li className='hits-item'>
          тільки зареєстровані користувачі можуть створювати статті, писати
          коментарі та ставити лайки коментарям
        </li>
      </ul>
    </div>
  )
}

export default Hints
