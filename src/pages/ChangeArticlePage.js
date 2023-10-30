import { useState, useEffect, useRef } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useLocalStorage from '../hooks/useLocalStorage'
import uniqid from 'uniqid'
import axios from '../axios'
import { useCheckAuth } from '../hooks/useCheckAuth'
import '../styles/createArticle.css'

const ChangeArticlePage = () => {
  const isLogin = useCheckAuth()
  const history = useHistory()
  if (!isLogin) history.push('/')

  const { id: articleId } = useParams()
  const [{ titleKey, descriptionKey, articleKey }, f] = useLocalStorage(
    'changeArticleKeys',
    generateKey(articleId)
  )

  const [title, setTitle] = useLocalStorage(titleKey, '')
  const changeMainTitle = (e) => setTitle(e.target.value)

  const [description, setDescription] = useLocalStorage(descriptionKey, '')
  const changeDescription = (e) => setDescription(e.target.value)

  const [article, setArticle] = useLocalStorage(articleKey, [
    { typeContent: 'subtitle', idInput: uniqid(), order: 0 },
    { typeContent: 'plaintext', idInput: uniqid(), order: 1 },
  ])

  const [showArticle, setShowArticle] = useState(false)
  useEffect(() => {
    axios
      .get(`/articles/${articleId}`)
      .then((response) => {
        const { article: articleObj } = response.data
        const { description, title, arrElementsJson } = articleObj
        let arrInputs = JSON.parse(arrElementsJson)

        arrInputs = arrInputs.map((inputObj) => {
          const { idContent, typeContent, order, value } = inputObj
          addToLocalStorage(idContent, value)

          return {
            idInput: idContent,
            typeContent,
            order,
          }
        })

        setArticle(arrInputs)
        setTitle(title)
        setDescription(description)

        setShowArticle(true)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const getArrInputs = () => {
    const arrInputsId = JSON.parse(window.localStorage.getItem(articleKey))

    return arrInputsId.map(({ typeContent, idInput, order }) => {
      return {
        idContent: idInput,
        typeContent,
        value: JSON.parse(window.localStorage.getItem(idInput)),
        order,
      }
    })
  }

  const submitArticle = (payload) => {
    axios
      .patch(`/articles/${articleId}`, payload)
      .then((response) => {
        console.log(response.data)
      })
      .catch((err) => {
        console.log(err.response)
      })
  }

  const clearLocalStorage = () => {
    const arrInputsId = JSON.parse(window.localStorage.getItem(articleKey))

    arrInputsId.forEach(({ idInput }) => {
      localStorage.removeItem(idInput)
    })

    localStorage.removeItem(titleKey)
    localStorage.removeItem(descriptionKey)
    localStorage.removeItem(articleKey)
  }
  const clickSubmit = () => {
    const arrInputs = getArrInputs()
    const arrElementsJson = JSON.stringify(arrInputs)
    console.log(arrElementsJson)
    const payload = {
      title,
      description,
      arrElementsJson,
    }
    submitArticle(payload)
    clearLocalStorage()
  }
  ///////////////////////////////////////////////////////////////

  return (
    <>
      <h1 className='title mb-20 mt-20'>Create article</h1>
      <input
        value={title}
        onChange={changeMainTitle}
        type='text'
        className='ar-input mb-10'
        placeholder='Title:'
      />
      <textarea
        value={description}
        onChange={changeDescription}
        className='ar-textarea mb-20'
        placeholder='Description:'
      ></textarea>
      <Block articleKey={articleKey} article={article} />
      <button onClick={clearLocalStorage} className='button'>
        clear local storage
      </button>
      <button onClick={clickSubmit} className='button'>
        save article
      </button>
    </>
  )
}

/////////////////////////////////////////////////////

const Block = ({ articleKey, article }) => {
  const [arrInputs, setArrInputs] = useLocalStorage(articleKey, article)
  useEffect(() => {
    setArrInputs(article)
  }, [article])
  const addInput = (typeContent) => {
    const newInput = { typeContent, idInput: uniqid(), order: arrInputs.length }

    setArrInputs((prevInputs) => {
      setArrInputs([...prevInputs, newInput])
      return [...prevInputs, newInput]
    })
  }
  const removeInput = (idInput, order) => {
    setArrInputs((prevInputs) => {
      let filteredInputs = []

      prevInputs.forEach((input) => {
        if (input.idInput === idInput) {
          localStorage.removeItem(idInput)
          localStorage.removeItem(`${idInput}FileData`)
          localStorage.removeItem(`${idInput}FileName`)
        } else {
          filteredInputs.push(input)
        }
      })

      filteredInputs = filteredInputs.map((input) => {
        if (input.order < order) {
          return input
        } else if (input.order > order) {
          return { ...input, order: input.order - 1 }
        }
        return input
      })

      setArrInputs(filteredInputs)
      return filteredInputs
    })
  }
  const inputUp = (idInput, order) => {
    if (order === 0) return

    setArrInputs((prevInputs) => {
      const newInputs = prevInputs.map((input) => {
        if (input.order === order - 1) {
          return { ...input, order }
        }
        if (input.order === order) {
          return { ...input, order: order - 1 }
        }
        return input
      })

      setArrInputs(newInputs)
      return newInputs
    })
  }
  const inputDown = (idInput, order) => {
    setArrInputs((prevInputs) => {
      if (order === prevInputs.length - 1) return prevInputs

      const newInputs = prevInputs.map((input) => {
        if (input.order === order + 1) {
          return { ...input, order }
        }
        if (input.order === order) {
          return { ...input, order: order + 1 }
        }
        return input
      })

      setArrInputs(newInputs)
      return newInputs
    })
  }
  const getInputActions = (idInput, order) => {
    return {
      inputUp: () => inputUp(idInput, order),
      inputDown: () => inputDown(idInput, order),
      removeInput: () => removeInput(idInput, order),
    }
  }

  const sortedArrInputs = arrInputs.sort((a, b) => a.order - b.order)

  return (
    <div className='ar-block'>
      <div className='ar-block-title'>{articleKey}</div>
      <div className='column'>
        {sortedArrInputs.map(({ typeContent, idInput, order }) => {
          const inputActions = getInputActions(idInput, order)
          return (
            <ShowInput
              key={idInput}
              typeContent={typeContent}
              idInput={idInput}
              order={order}
              inputActions={inputActions}
            />
          )
        })}
      </div>
      <button
        onClick={() => addInput('subtitle')}
        className='ar-add-block mr-10'
      >
        add input
      </button>
      <button
        onClick={() => addInput('plaintext')}
        className='ar-add-block mr-10'
      >
        add textarea
      </button>
      <button onClick={() => addInput('list')} className='ar-add-block mr-10'>
        add list
      </button>
      <button onClick={() => addInput('img')} className='ar-add-block mr-10'>
        add img
      </button>
    </div>
  )
}

const ShowInput = ({ typeContent, idInput, inputActions, order }) => {
  switch (typeContent) {
    case 'subtitle':
      return (
        <Input
          key={idInput}
          idInput={idInput}
          inputActions={inputActions}
          order={order}
        />
      )
    case 'plaintext':
      return (
        <TextArea
          key={idInput}
          idInput={idInput}
          inputActions={inputActions}
          order={order}
        />
      )
    case 'list':
      return (
        <InputList
          key={idInput}
          idInput={idInput}
          inputActions={inputActions}
          order={order}
        />
      )

    case 'img':
      return (
        <InputImg
          key={idInput}
          idInput={idInput}
          inputActions={inputActions}
          order={order}
        />
      )

    default:
      break
  }
}

const TextArea = ({ idInput, inputActions, order }) => {
  const textareaRef = useRef(null)
  const [textareaHeight, setTextareaHeight] = useState('auto')
  const [value, setValue] = useLocalStorage(idInput, '')

  const changeTextAreaHeight = ({ scrollHeight, clientHeight }) => {
    setTextareaHeight(
      scrollHeight > clientHeight ? scrollHeight + 'px' : 'auto'
    )
  }
  const handleChange = (e) => {
    const { scrollHeight, clientHeight } = e.target
    changeTextAreaHeight({ scrollHeight, clientHeight })
    setValue(e.target.value)
  }

  useEffect(() => {
    const { scrollHeight, clientHeight } = textareaRef.current
    changeTextAreaHeight({ scrollHeight, clientHeight })
  }, [])

  const { inputUp, inputDown, removeInput } = inputActions
  return (
    <div className='ar-input-container mb-20'>
      <div className='ar-input-container-left'>
        <button onClick={inputUp} className='ar-arrow-button'>
          +
        </button>
        <button onClick={inputDown} className='ar-arrow-button mt-10'>
          -
        </button>
      </div>
      {/* ////////////////////////////////////////////////// */}

      <div className='ar-input-container-center'>
        <textarea
          onChange={handleChange}
          value={value}
          className='ar-textarea'
          style={{ height: textareaHeight }}
          placeholder={idInput + '---' + order}
          ref={textareaRef}
        ></textarea>
      </div>

      {/* ////////////////////////////////////////////////// */}

      <div className='ar-input-container-right'>
        <button onClick={removeInput} className='button'>
          dell
        </button>
      </div>
    </div>
  )
}
const Input = ({ idInput, inputActions, order }) => {
  const [value, setValue] = useLocalStorage(idInput, '')
  const changeValue = (e) => setValue(e.target.value)

  const { inputUp, inputDown, removeInput } = inputActions

  return (
    <div className='ar-input-container mb-20'>
      <div className='ar-input-container-left'>
        <button onClick={inputUp} className='ar-arrow-button'>
          +
        </button>
        <button onClick={inputDown} className='ar-arrow-button mt-10'>
          -
        </button>
      </div>
      {/* ////////////////////////////////////////////////// */}
      <div className='ar-input-container-center'>
        <input
          value={value}
          onChange={changeValue}
          type='text'
          className='ar-input'
          placeholder={idInput + ''}
        />
      </div>

      {/* ////////////////////////////////////////////////// */}

      <div className='ar-input-container-right'>
        <button onClick={removeInput} className='button'>
          dell
        </button>
      </div>
    </div>
  )
}
const InputList = ({ idInput, inputActions, order }) => {
  const [value, setValue] = useLocalStorage(idInput, {
    titleList: '',
    items: [{ itemId: uniqid(), itemText: '' }],
  })

  const changeTitleList = (e) => {
    setValue((prevValue) => {
      const newValue = {
        ...prevValue,
        titleList: e.target.value,
      }

      setValue(newValue)
      return newValue
    })
  }

  const addItem = () => {
    setValue((prevValue) => {
      const newValue = {
        ...prevValue,
        items: [...prevValue.items, { itemId: uniqid(), itemText: '' }],
      }

      setValue(newValue)
      return newValue
    })
  }

  const changeItem = (e, itemId) => {
    setValue((prevValue) => {
      const newValue = {
        ...prevValue,
        items: prevValue.items.map((item) => {
          if (item.itemId === itemId) {
            return {
              ...item,
              itemText: e.target.value,
            }
          }
          return item
        }),
      }

      setValue(newValue)
      return newValue
    })
  }

  const { inputUp, inputDown, removeInput } = inputActions

  return (
    <div className='ar-input-container mb-20'>
      <div className='ar-input-container-left'>
        <button onClick={inputUp} className='ar-arrow-button'>
          +
        </button>
        <button onClick={inputDown} className='ar-arrow-button mt-10'>
          -
        </button>
      </div>
      {/* ////////////////////////////////////////////////// */}
      <div className='ar-input-container-center'>
        <input
          value={value.titleList}
          onChange={changeTitleList}
          type='text'
          className='input mb-10'
        />
        <div className='ar-list-container'>
          {value.items.map(({ itemId, itemText }) => {
            return (
              <input
                onChange={(e) => changeItem(e, itemId)}
                value={itemText}
                key={itemId}
                type='text'
                className='input ml-30 mb-10'
              />
            )
          })}
        </div>

        <button onClick={addItem} className='ar-add-block ml-30'>
          add list item
        </button>
      </div>

      {/* ////////////////////////////////////////////////// */}

      <div className='ar-input-container-right'>
        <button onClick={removeInput} className='button'>
          dell
        </button>
      </div>
    </div>
  )
}
const InputImg = ({ idInput, inputActions, order }) => {
  const [value, setValue] = useLocalStorage(idInput, {
    fileName: '',
    imgName: '',
  })
  const changeImgName = (e) => {
    setValue((prevValue) => {
      const newImgName = e.target.value

      setValue({ ...prevValue, imgName: newImgName })
      return { ...prevValue, imgName: newImgName }
    })
  }
  const changeFileName = (newFileName) => {
    setValue((prevValue) => {
      setValue({ ...prevValue, fileName: newFileName })
      return { ...prevValue, fileName: newFileName }
    })
  }

  const deleteImgFromDb = async (fileNameToDelete) => {
    try {
      const url = `/images?fileName=${fileNameToDelete}`
      const response = await axios.delete(url)

      console.log('Изображение успешно удалено:', response.data)
    } catch (error) {
      console.error('Произошла ошибка при удалении изображения:', error)
    }
  }
  const sendImg = async (selectedFile, newFileName) => {
    const formData = new FormData()
    formData.append('images', selectedFile, newFileName)

    try {
      const { data } = await axios.post('/images', formData)
      console.log('Изображение успешно загружено:', data)
    } catch (error) {
      console.error('Произошла ошибка при загрузке изображения:', error)
    }
  }

  const changeFile = async (e) => {
    try {
      const selectedFile = e.target.files[0]
      if (!selectedFile) return

      await deleteImgFromDb(value.fileName)

      const newFileName = idInput + sanitizeFileName(selectedFile.name)

      await sendImg(selectedFile, newFileName)

      changeFileName(newFileName)
    } catch (error) {
      console.log(error)
    }
  }

  const { inputUp, inputDown, removeInput } = inputActions
  return (
    <div className='ar-input-container mb-20'>
      <div className='ar-input-container-left'>
        <button onClick={inputUp} className='ar-arrow-button'>
          +
        </button>
        <button onClick={inputDown} className='ar-arrow-button mt-10'>
          -
        </button>
      </div>
      {/* ////////////////////////////////////////////////// */}

      <div className='ar-input-container-center'>
        {value.fileName !== '' ? (
          <div className='ar-img-container'>
            <img
              src={`http://localhost:4444/${value.fileName}`}
              alt=''
              className='img'
            />
          </div>
        ) : null}

        <label className='ar-file-label'>
          <input onChange={changeFile} type='file' className='file-input' />
          <div className='ar-add-img'>choose img</div>
        </label>
        <input
          onChange={changeImgName}
          value={value.imgName}
          type='text'
          className='input'
          placeholder='img description:'
        />
      </div>

      {/* ////////////////////////////////////////////////// */}

      <div className='ar-input-container-right'>
        <button onClick={removeInput} className='button'>
          dell
        </button>
      </div>
    </div>
  )
}
function sanitizeFileName(fileName) {
  return fileName.replace(/[^\w\d\-_. ]/g, '')
}

function addToLocalStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function generateKey(articleId) {
  return {
    titleKey: `${articleId}titleKey`,
    descriptionKey: `${articleId}descriptionKey`,
    articleKey: `${articleId}articleKey`,
  }
}

export default ChangeArticlePage
