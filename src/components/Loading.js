import spinerImg from '../images/spiner.gif'

const Loading = () => {
  return (
    <div className='loading-wrapper'>
      <div className='loading-img-container'>
        <img src={spinerImg} alt='spiner' className='img loading-img' />
      </div>
    </div>
  )
}

export default Loading
