import { useState, useEffect } from 'react'
import { useCheckAuth } from './useCheckAuth'

export const useRating = (userId, arrLikes, arrDislikes, click) => {
  const isLogin = useCheckAuth()

  const { userLikeThis, userDislikeThis, countLikes, countDislikes } =
    getRatingData(userId, arrLikes, arrDislikes)

  const [liked, setLiked] = useState(userLikeThis)
  const [disliked, setDisliked] = useState(userDislikeThis)
  const [numLikes, setNumLikes] = useState(countLikes)
  const [numDislikes, setNumDislikes] = useState(countDislikes)

  const clickLike = () => {
    if (!isLogin) return alert('зарегайся сука')

    setDisliked(false)
    setLiked((liked) => {
      click(!liked, false)

      return !liked
    })
  }
  const clickDislike = () => {
    if (!isLogin) return alert('зарегайся сука')

    setLiked(false)
    setDisliked((disliked) => {
      click(false, !disliked)
      return !disliked
    })
  }

  const updateState = (userId, arrLikes, arrDislikes) => {
    const { userLikeThis, userDislikeThis, countLikes, countDislikes } =
      getRatingData(userId, arrLikes, arrDislikes)
    setLiked(userLikeThis)
    setDisliked(userDislikeThis)
    setNumLikes(countLikes)
    setNumDislikes(countDislikes)
  }

  return {
    numLikes,
    numDislikes,
    liked,
    disliked,
    clickLike,
    clickDislike,
    updateState,
  }
}

function getRatingData(userId, arrLikes, arrDislikes) {
  const userLikeThis = !!arrLikes.find((id) => userId === id)
  const userDislikeThis = !!arrDislikes.find((id) => userId === id)
  const countLikes = userLikeThis ? arrLikes.length - 1 : arrLikes.length
  const countDislikes = userDislikeThis
    ? arrDislikes.length - 1
    : arrDislikes.length

  return { userLikeThis, userDislikeThis, countLikes, countDislikes }
}
