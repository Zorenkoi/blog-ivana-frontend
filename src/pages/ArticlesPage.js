import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { cutString } from '../helper/cutString'
import { Link, useHistory } from 'react-router-dom'
import Error from '../components/Error'
import Loading from '../components/Loading'
import axios from '../axios'
import trashImg from '../images/trash.png'
import editImg from '../images/edit.png'
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

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type='text'
        className='input full-width mt-20'
        placeholder='Введіть назву статті:'
      />
      {filteredArticles.length === 0 ? (
        <h1 className='mt-20'>Немає статей по запиту: "{query}"</h1>
      ) : (
        <div className={s.articlesContainer}>
          <ArticlesList
            articles={filteredArticles}
            deleteArticle={deleteArticle}
          />
        </div>
      )}
    </>
  )
}

const ArticlesList = ({ articles, deleteArticle }) => {
  const history = useHistory()
  const { userId } = useSelector((state) => state.userReducer)

  return articles.map(
    ({ title, description, authorName, authorId, _id, arrImgFileNames }) => {
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
  isAuthor,
  _id,
  arrImgFileNames,
  clickDelete,
  clickChange,
}) => {
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

export default ArticlesPage
