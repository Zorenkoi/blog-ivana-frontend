import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useDispatch } from 'react-redux'
import Loading from './components/Loading'

// import ArticlesPage from './pages/ArticlesPage'
// import CreateArticlePage from './pages/CreateArticlePage'
// import ChangeArticlePage from './pages/ChangeArticlePage'
// import ChangeArticlePage2 from './pages/ChangeArticlePage2'
// import OneArticle from './pages/OneArticle'
import Header from './components/Header'
import Modal from './components/Modal'

import { login, logout } from './redux/slices/userReducer'
import axios from './axios'

import './styles/App.css'

const ArticlesPage = lazy(() => import('./pages/ArticlesPage'))
const CreateArticlePage = lazy(() => import('./pages/CreateArticlePage'))
const ChangeArticlePage2 = lazy(() => import('./pages/ChangeArticlePage2'))
const OneArticle = lazy(() => import('./pages/OneArticle'))

const App = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    axios('/auth/me')
      .then((response) => {
        const { userId, userName } = response.data
        dispatch(login({ userId, userName }))
      })
      .catch((err) => {
        console.log(err)
        dispatch(logout())
      })
  })

  return (
    <Router>
      <Header />
      <Modal />
      <div className='wrapper'>
        <Switch>
          <Suspense fallback={<Loading />}>
            <Route path='/' exact component={ArticlesPage} />
            <Route path='/createarticle' component={CreateArticlePage} />
            <Route path='/changearticle/:id' component={ChangeArticlePage2} />
            <Route path='/articles/:id' component={OneArticle} />
          </Suspense>
        </Switch>
      </div>
    </Router>
  )
}

const Load = () => {
  return <h1>Loading</h1>
}

export default App
