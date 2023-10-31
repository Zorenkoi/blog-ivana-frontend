import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { cutString } from '../helper/cutString'
import { Link, useHistory } from 'react-router-dom'
import axios from '../axios'

import trashImg from '../images/trash.png'
import editImg from '../images/edit.png'

import Error from '../components/Error'
import Loading from '../components/Loading'
import Hints from '../components/Hints'

import s from '../styles/articles.module.css'

const ArticlesPage = () => {
  const [statusPage, setStatusPage] = useState('loading')
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState([])

  const updateArticles = () => {
    setStatusPage('loading')
    axios
      .get('/articles')
      .then((response) => {
        setStatusPage('ok')
        setArticles(response.data.articles)
        console.log(response.data.articles)
      })
      .catch((err) => {
        setStatusPage('error')
        console.log(err)
      })
  }
  const deleteArticle = (articleId, authorId, userId) => {
    if (authorId !== userId) return

    setStatusPage('loading')

    axios
      .delete(`/articles/${articleId}`)
      .then((response) => {
        setArticles((prevArticles) => {
          return prevArticles.filter((article) => article._id !== articleId)
        })
        setStatusPage('ok')
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(updateArticles, [])

  if (statusPage === 'loading') return <Loading />
  if (statusPage === 'error') return <Error />

  const filteredArticles = filterArticlesByQuery(articles, query)
  const sortedArticles = sortArticlesByCreatedAt(filteredArticles)

  return (
    <div className='articles-wrapper'>
      <div className='articles-main'>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type='text'
          className='input full-width'
          placeholder='Введіть назву статті:'
        />
        {sortedArticles.length === 0 ? (
          <h1 className='mt-20'>Немає статей по запиту: "{query}"</h1>
        ) : (
          <div className={s.articlesContainer}>
            <ArticlesList
              articles={filteredArticles}
              deleteArticle={deleteArticle}
            />
          </div>
        )}
      </div>

      <Hints />
    </div>
  )
}

const ArticlesList = ({ articles, deleteArticle }) => {
  const history = useHistory()
  const { userId } = useSelector((state) => state.userReducer)

  return articles.map(
    ({
      title,
      description,
      authorName,
      createdAt,
      authorId,
      _id,
      arrImgFileNames,
    }) => {
      const isAuthor = authorId === userId

      const clickDelete = () => {
        deleteArticle(_id, authorId, userId)
        deletAarrImgFileNames(arrImgFileNames, authorId, userId)
      }
      const clickChange = () => {
        history.push(`/changearticle/${_id}`)
      }

      return (
        <ArticleCard
          key={_id}
          title={title}
          description={description}
          authorName={authorName}
          createdAt={createdAt}
          isAuthor={isAuthor}
          _id={_id}
          arrImgFileNames={arrImgFileNames}
          clickDelete={clickDelete}
          clickChange={clickChange}
        />
      )
    }
  )
}
const ArticleCard = ({
  title,
  description,
  authorName,
  createdAt,
  isAuthor,
  _id,
  arrImgFileNames,
  clickDelete,
  clickChange,
}) => {
  console.log(createdAt)
  const date = formatDate(createdAt)
  console.log(date)
  return (
    <div className='article-card'>
      {arrImgFileNames.length !== 0 ? (
        <Link to={`/articles/${_id}`} className='article-card-img-link'>
          <div className='article-card-img-wrapper'>
            <img
              src={`https://blog-ivana-35067453cc4f.herokuapp.com/${arrImgFileNames[0]}`}
              alt=''
              className='img'
            />
          </div>
        </Link>
      ) : null}

      <div className='article-card-info'>
        <Link to={`/articles/${_id}`} className='article-card-link'>
          <div className='article-card-title'>{title}</div>
        </Link>
        <div className='article-card-description'>
          {cutString(description, 250)}
        </div>
        <div className='article-card-bottom'>
          <div className='article-card-author'>{authorName}</div>
          <div className='article-card-date'>{date}</div>
          {isAuthor ? (
            <div className='article-card-buttons-container'>
              <IconButton img={editImg} click={clickChange}></IconButton>
              <IconButton img={trashImg} click={clickDelete}></IconButton>
            </div>
          ) : null}
        </div>
      </div>

      {/* ///////////////////////////////////////////////// */}
    </div>
  )
}
const IconButton = ({ img, click }) => {
  return (
    <button onClick={click} className={s.trashButton}>
      <div className={s.trashButtonImgWrapper}>
        <img src={img} alt='' className='img-contain' />
      </div>
    </button>
  )
}

function filterArticlesByQuery(articles, query) {
  if (query === '') return articles

  const lowerQuery = query.toLowerCase()

  return articles.filter(({ title }) => {
    return title.toLowerCase().includes(lowerQuery)
  })
}
function sortArticlesByCreatedAt(posts) {
  // Используем метод sort() для сравнения постов по полю createdAt
  posts.sort((postA, postB) => {
    const createdAtA = new Date(postA.createdAt)
    const createdAtB = new Date(postB.createdAt)

    // Сравниваем даты в обратном порядке (сначала самые новые)
    if (createdAtA > createdAtB) return -1
    if (createdAtA < createdAtB) return 1
    return 0
  })

  return posts
}
function deletAarrImgFileNames(arrImgFileNames, authorId, userId) {
  if (authorId !== userId) return
  if (arrImgFileNames.length === 0) return

  arrImgFileNames.forEach((imgFileName) => {
    deleteImgFromDb(imgFileName)
  })
}
async function deleteImgFromDb(fileNameToDelete) {
  try {
    const url = `/images?fileName=${fileNameToDelete}`
    const response = await axios.delete(url)

    console.log('Изображение успешно удалено:', response.data)
  } catch (error) {
    console.error('Произошла ошибка при удалении изображения:', error)
  }
}
function formatDate(inputTime) {
  const dateTime = new Date(inputTime)

  function getMonthName(monthNumber) {
    const monthNames = [
      'січня',
      'лютого',
      'березня',
      'квітня',
      'травня',
      'червня',
      'липня',
      'серпня',
      'вересня',
      'жовтня',
      'листопада',
      'грудня',
    ]
    return monthNames[monthNumber - 1]
  }

  const formattedTime = `${dateTime.getDate()} ${getMonthName(
    dateTime.getMonth() + 1
  )} ${dateTime.getFullYear()}, ${dateTime.getHours()}:${String(
    dateTime.getMinutes()
  ).padStart(2, '0')}`

  return formattedTime
}

export default ArticlesPage
