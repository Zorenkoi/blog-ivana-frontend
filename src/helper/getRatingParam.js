export const getRatingParam = (userId, arrLikes, arrDislikes) => {
  const userLikeThis = arrLikes.find((id) => userId === id)
  const userDislikeThis = arrDislikes.find((id) => userId === id)

  const countLikes = userLikeThis ? arrLikes.length - 1 : arrLikes.length
  const countDislikes = userDislikeThis
    ? arrDislikes.length - 1
    : arrDislikes.length

  return {
    countLikes,
    countDislikes,
    initialLiked: !!userLikeThis,
    initialDisliked: !!userDislikeThis,
  }
}
