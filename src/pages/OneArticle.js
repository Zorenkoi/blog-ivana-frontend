import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import like from '../images/simple-like.png'
import { useRating } from '../hooks/useRating'
import { useCheckAuth } from '../hooks/useCheckAuth'
import axios from '../axios'

import Loading from '../components/Loading'
import Error from '../components/Error'

import s from '../styles/oneArticle.module.css'

const OneArticle = () => {
  const { id: articleId } = useParams()

  const [statusPage, setStatusPage] = useState('loading')
  const [title, setTitle] = useState('')
  const [arrElements, setArrElements] = useState([])
  const [authorName, setAuthorName] = useState('')
  /////////////////////////////////////////////

  useEffect(() => {
    axios
      .get(`/articles/${articleId}`)
      .then((response) => {
        const { title, arrElementsJson, authorName } = response.data.article

        setStatusPage('ok')
        setTitle(title)
        setAuthorName(authorName)
        setArrElements(JSON.parse(arrElementsJson))
      })
      .catch((err) => {
        setStatusPage('error')
        console.log(err)
      })
  }, [])

  if (statusPage === 'loading') return <Loading />
  if (statusPage === 'error') return <Error />

  return (
    <div className={s.articleWrapper}>
      <ShowTitle title={title} authorName={authorName} />
      <ShowBlock arrElements={arrElements} />
      <FirstCommentBlock articleId={articleId} />
    </div>
  )
}

const ShowTitle = ({ title, authorName }) => {
  return (
    <>
      <div className='row-space mt-20'>
        <h1 className={s.title}>{title}</h1>
      </div>
    </>
  )
}

const ShowBlock = ({ arrElements }) => {
  const sortedArrElements = arrElements.sort((a, b) => a.order - b.order)
  return (
    <div className={s.block}>
      {sortedArrElements.map(({ idContent, typeContent, value }) => {
        return (
          <ShowContent
            key={idContent}
            typeContent={typeContent}
            idContent={idContent}
            value={value}
          />
        )
      })}
    </div>
  )
}

const ShowContent = ({ typeContent, idContent, value }) => {
  switch (typeContent) {
    case 'subtitle':
      return <ShowSubtitle key={idContent} value={value} />
    case 'plaintext':
      return <ShowText key={idContent} value={value} />
    case 'list':
      return <ShowList key={idContent} value={value} />
    case 'img':
      return <ShowImg key={idContent} value={value} />

    default:
      break
  }
}
const ShowSubtitle = ({ value }) => {
  return <h2 className={s.subtitle}>{value}</h2>
}
const ShowText = ({ value }) => {
  return <p className={s.text}>{value}</p>
}
const ShowList = ({ value }) => {
  const { titleList, items } = value
  return (
    <div className='column'>
      <p className={s.titlelist}>{titleList}</p>
      <ul className={s.list}>
        {items.map(({ itemId, itemText }) => {
          return (
            <li className={s.itemlist} key={itemId}>
              {itemText}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
const ShowImg = ({ value }) => {
  return (
    <div className={s.imgContainer}>
      <img
        src={`https://blog-ivana-35067453cc4f.herokuapp.com/${value.fileName}`}
        alt={value.imgName}
        className='img'
      />
    </div>
  )
}

/////////////////////////////////////////////////////////

const FirstCommentBlock = ({ articleId }) => {
  const [comments, setComments] = useState([])

  const updateComments = () => {
    axios
      .get(`/comments/rootcomment/${articleId}`)
      .then((response) => {
        setComments(response.data.comments)
      })
      .catch((err) => console.log(err))
  }

  useEffect(updateComments, [])

  return (
    <>
      <div className='sub-title mb-10'>Комментарі</div>
      <CommentForm articleId={articleId} updateComments={updateComments} />
      {comments.map((comment) => {
        return <CommentBlock key={comment._id} {...comment} />
      })}
    </>
  )
}

const CommentForm = ({ articleId, updateComments }) => {
  const isLogin = useCheckAuth()
  const [commentText, setCommentText] = useState('')

  const submit = () => {
    if (!isLogin) return alert('зарегайся сука')

    const payload = {
      commentText,
      articleId,
    }

    axios
      .post(`/comments/rootcomment/${articleId}`, payload)
      .then((response) => {
        updateComments()
      })
      .catch((err) => {
        console.log(err)
        if (err.response.data.message === 'нет доступа') {
          alert('зарегайся сука')
        }
      })

    setCommentText('')
  }

  return (
    <>
      <div className='comment-input-container mb-20'>
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          type='text'
          className='comment-input'
          placeholder='ваш комментар:'
        />
        <button onClick={submit} className='comment-button'>
          відправити
        </button>
      </div>
    </>
  )
}

const CommentBlock = ({ _id }) => {
  const [showRating, setShowRating] = useState(true)
  const toggleShowRating = () => setShowRating((showRating) => !showRating)

  const [arrLikes, setArrLikes] = useState([])
  const [arrDislikes, setArrDislikes] = useState([])
  const [answersId, setAnswersId] = useState([])
  const [answerInfo, setAnswerInfo] = useState({
    commentatorName: '',
    commentText: '',
  })

  const updateAnswers = () => {
    axios
      .get(`/comments/answer/${_id}`)
      .then((response) => {
        const { answers, commentatorName, commentText, arrLikes, arrDislikes } =
          response.data.answer

        setAnswersId(answers)
        setAnswerInfo({
          commentatorName,
          commentText,
        })
        setArrLikes(arrLikes)
        setArrDislikes(arrDislikes)
      })
      .catch((err) => {
        console.log(err)
      })
  }
  useEffect(updateAnswers, [])

  const { commentatorName, commentText } = answerInfo
  return (
    <>
      <div className='comment-container'>
        <div className='comment-left'>
          <div className='comment-icon'></div>
        </div>
        <div className='comment-info'>
          <div className='comment-name'>{commentatorName}</div>
          <div className='comment-text'>{commentText}</div>
          <div className='answer-form-container'>
            {showRating ? (
              <Rate
                commentId={_id}
                toggleShowRating={toggleShowRating}
                arrLikes={arrLikes}
                arrDislikes={arrDislikes}
                updateAnswers={updateAnswers}
              />
            ) : (
              <AnswerForm
                toggleShowRating={toggleShowRating}
                parentCommentId={_id}
                updateAnswers={updateAnswers}
              />
            )}
          </div>

          {/* ///////////////////////////////////////////////////////////// */}
          <div className='answers-container'>
            {answersId.map((answerId) => (
              <CommentBlock _id={answerId} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

const AnswerForm = ({ parentCommentId, updateAnswers, toggleShowRating }) => {
  const [commentText, setCommentText] = useState('')

  const submit = () => {
    const payload = {
      commentText,
      parentCommentId,
    }

    axios
      .post(`/comments/answer/${parentCommentId}`, payload)
      .then((response) => {
        updateAnswers()
        toggleShowRating()
      })
      .catch((err) => {
        console.log(err)
      })

    setCommentText('')
  }

  return (
    <>
      <div className='answer-input-container'>
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          type='text'
          className='answer-input'
          placeholder='ваша відповідь:'
        />
        <button onClick={toggleShowRating} className='answer-button'>
          відмінити
        </button>
        <button onClick={submit} className='answer-button'>
          відповісти
        </button>
      </div>
    </>
  )
}

const Rate = ({
  toggleShowRating,
  commentId,
  arrLikes,
  arrDislikes,
  updateAnswers,
}) => {
  const { userId } = useSelector((state) => state.userReducer)

  const [timer, setTimer] = useState(null)
  const handleServer = (action) => {
    const payload = {
      userId,
    }
    axios
      .post(`/comments/${action}/${commentId}`, payload)
      .then((response) => {
        updateAnswers()
      })
      .catch((err) => {
        console.log(err)
      })
  }
  const whatWeDoWithServer = (liked, disliked) => {
    if (liked) {
      handleServer('like')
    } else if (disliked) {
      handleServer('dislike')
    } else if (!liked && !disliked) {
      handleServer('cancelrating')
    }
  }
  const click = (liked, disliked) => {
    if (timer) {
      clearTimeout(timer)
    }

    const newTimer = setTimeout(() => {
      whatWeDoWithServer(liked, disliked)
    }, 2000)
    setTimer(newTimer)
  }

  const {
    numLikes,
    numDislikes,
    liked,
    disliked,
    clickLike,
    clickDislike,
    updateState,
  } = useRating(userId, arrLikes, arrDislikes, click)

  useEffect(() => {
    updateState(userId, arrLikes, arrDislikes)
  }, [userId, arrLikes, arrDislikes])

  const clickAddAnswer = () => {
    updateAnswers()
    toggleShowRating()
  }

  return (
    <div className='row-start'>
      <div className='rating-container'>
        <button
          onClick={clickLike}
          style={styleF(liked)}
          className='circle-button'
        >
          <div className='like-img-wrapper'>
            <img src={like} alt='' className='img' />
          </div>
        </button>
        <div className='rating-count'>{liked ? numLikes + 1 : numLikes}</div>
      </div>
      <div className='rating-container'>
        <button
          onClick={clickDislike}
          style={styleF(disliked)}
          className='circle-button'
        >
          <div className='dislike-img-wrapper'>
            <img src={like} alt='' className='img' />
          </div>
        </button>
        <div className='rating-count'>
          {disliked ? numDislikes + 1 : numDislikes}
        </div>
      </div>

      <button onClick={clickAddAnswer} className='answer-button'>
        відповісти
      </button>
    </div>
  )
}

const styleF = (bool) => {
  if (bool) return { backgroundColor: 'rgb(220, 110, 134)' }
  else return null
}

export default OneArticle
