import { useState, useEffect, useRef } from 'react'
import uniqid from 'uniqid'
import axios from '../axios'
import useLocalStorage from '../hooks/useLocalStorage'
import { useHistory } from 'react-router-dom'
import { useCheckAuth } from '../hooks/useCheckAuth'
import arrowDownImg from '../images/arrow-down.png'
import trashImg from '../images/trash.png'

import '../styles/createArticle.css'

const CreateArticlePage = () => {
  const isLogin = useCheckAuth()
  const history = useHistory()
  if (!isLogin) history.push('/')

  const [{ titleKey, descriptionKey, articleKey }, setKeys] = useLocalStorage(
    'createArticleKey',
    generateKeys(uniqid())
  )

  const [title, setTitle] = useLocalStorage(titleKey, '')
  const changeMainTitle = (e) => setTitle(e.target.value)

  const [description, setDescription] = useLocalStorage(descriptionKey, '')
  const changeDescription = (e) => setDescription(e.target.value)

  const [arrInputs, setArrInputs] = useLocalStorage(
    articleKey,
    getDefaultArrInputs()
  )

  ///////////////////////////////////////////////////////////////////////////

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

  const getArrImgFileNames = (arrInputs) => {
    const arrImgInputs = arrInputs.filter(
      (input) => input.typeContent === 'img'
    )
    return arrImgInputs.map((imgInput) => imgInput.value.fileName)
  }
  const resetPage = () => {
    clearLocalStorageAfterCreateArticle()

    setTitle('')
    setDescription('')
    setArrInputs(getDefaultArrInputs())
  }

  const submitArticle = (payload) => {
    axios
      .post('/articles', payload)
      .then((response) => {
        console.log(response.data)
        resetPage()
        history.push(`/articles/${response.data._id}`)
      })
      .catch((err) => {
        console.log(err.response)
      })
  }

  const clickSubmit = () => {
    const arrInputs = getArrInputs()
    const arrElementsJson = JSON.stringify(arrInputs)

    const arrImgFileNames = getArrImgFileNames(arrInputs)

    const payload = {
      title,
      description,
      arrElementsJson,
      arrImgFileNames,
    }

    submitArticle(payload)
  }
  ///////////////////////////////////////////////////////////////

  return (
    <div className='create-article-wrapper'>
      <div className='title mb-20'>Створити статтю</div>

      <div className='ar-label'>Заголовок:</div>
      <input
        value={title}
        onChange={changeMainTitle}
        type='text'
        className='ar-title-input mb-20'
      />

      <div className='ar-label'>Опис:</div>
      <textarea
        value={description}
        onChange={changeDescription}
        className='ar-textarea mb-20'
      ></textarea>

      <Block arrInputs={arrInputs} setArrInputs={setArrInputs} />

      <div className='main-buttons-container'>
        <button onClick={resetPage} className='button ml-20'>
          скинути
        </button>
        <button onClick={clickSubmit} className='button ml-20'>
          відправити
        </button>
      </div>
    </div>
  )
}
//////////////////////////////////////////////////////////////////////

const Block = ({ arrInputs, setArrInputs }) => {
  const addInput = (typeContent) => {
    const newInput = { typeContent, idInput: uniqid(), order: arrInputs.length }

    setArrInputs((prevInputs) => {
      setArrInputs([...prevInputs, newInput])
      return [...prevInputs, newInput]
    })
  }
  const removeInput = (idInput, order, beforeDieF) => {
    if (!!beforeDieF) beforeDieF()

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
      removeInput: (beforeDieF) => removeInput(idInput, order, beforeDieF),
    }
  }

  const sortedArrInputs = arrInputs.sort((a, b) => a.order - b.order)

  return (
    <div className='ar-block mb-30'>
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

      <div className='buttons-container'>
        <button
          onClick={() => addInput('subtitle')}
          className='ar-add-block mr-10'
        >
          + підзаголовок
        </button>
        <button
          onClick={() => addInput('plaintext')}
          className='ar-add-block mr-10'
        >
          + текст
        </button>
        <button onClick={() => addInput('list')} className='ar-add-block mr-10'>
          + список
        </button>
        <button onClick={() => addInput('img')} className='ar-add-block mr-10'>
          + зображення
        </button>
      </div>
    </div>
  )
}
function getDefaultArrInputs() {
  return [
    { typeContent: 'subtitle', idInput: uniqid(), order: 0 },
    { typeContent: 'plaintext', idInput: uniqid(), order: 1 },
  ]
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
      <MoveController clickUp={inputUp} clickDown={inputDown} />
      {/* ////////////////////////////////////////////////// */}

      <div className='ar-input-container-center'>
        <textarea
          onChange={handleChange}
          value={value}
          className='ar-textarea'
          style={{ height: textareaHeight }}
          placeholder='текст:'
          ref={textareaRef}
        ></textarea>
      </div>

      {/* ////////////////////////////////////////////////// */}

      <DellButton click={() => removeInput(false)} />
    </div>
  )
}
const Input = ({ idInput, inputActions, order }) => {
  const [value, setValue] = useLocalStorage(idInput, '')
  const changeValue = (e) => setValue(e.target.value)

  const { inputUp, inputDown, removeInput } = inputActions

  return (
    <div className='ar-input-container mb-20'>
      <MoveController clickUp={inputUp} clickDown={inputDown} />
      {/* ////////////////////////////////////////////////// */}
      <div className='ar-input-container-center'>
        <input
          value={value}
          onChange={changeValue}
          type='text'
          className='ar-input'
          placeholder='підзаголовок:'
        />
      </div>
      {/* ////////////////////////////////////////////////// */}
      <DellButton click={() => removeInput(false)} />
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
  const removeItem = (itemId) => {
    setValue((prevValue) => {
      const newValue = {
        ...prevValue,
        items: prevValue.items.filter((item) => item.itemId !== itemId),
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
      <MoveController clickUp={inputUp} clickDown={inputDown} />
      {/* ////////////////////////////////////////////////// */}
      <div className='ar-input-container-center'>
        <input
          value={value.titleList}
          onChange={changeTitleList}
          type='text'
          className='ar-input mb-10'
          placeholder='заголовок списку:'
        />
        <div className='ar-list-container pl-30'>
          {value.items.map(({ itemId, itemText }) => {
            return (
              <div className='list-item-container'>
                <input
                  onChange={(e) => changeItem(e, itemId)}
                  value={itemText}
                  key={itemId}
                  type='text'
                  className='list-item-input mb-10 mr-10'
                  placeholder='елемент списку:'
                />
                <DellButton
                  click={() => {
                    removeItem(itemId)
                  }}
                />
              </div>
            )
          })}
        </div>

        <button onClick={addItem} className='ar-add-block ml-30'>
          + елемент списку
        </button>
      </div>

      {/* ////////////////////////////////////////////////// */}

      <DellButton click={() => removeInput(false)} />
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
  const deleteImg = async () => {
    if (value.fileName) {
      await deleteImgFromDb(value.fileName)
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

      await deleteImg()

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
      <MoveController clickUp={inputUp} clickDown={inputDown} />
      {/* ////////////////////////////////////////////////// */}

      <div className='ar-input-container-center'>
        {value.fileName !== '' ? (
          <div className='ar-img-container'>
            <img
              src={`https://blog-ivana-35067453cc4f.herokuapp.com/${value.fileName}`}
              alt=''
              className='img'
            />
          </div>
        ) : null}

        <label className='ar-file-label'>
          <input onChange={changeFile} type='file' className='file-input' />
          <div className='ar-add-img'>обрати зображення</div>
        </label>
        <input
          onChange={changeImgName}
          value={value.imgName}
          type='text'
          className='ar-input'
          placeholder='опис зображення:'
        />
      </div>

      {/* ////////////////////////////////////////////////// */}

      <DellButton click={() => removeInput(deleteImg)} />
    </div>
  )
}

const MoveController = ({ clickUp, clickDown }) => {
  return (
    <div className='ar-input-container-left'>
      <button onClick={clickUp} className='ar-arrow-button'>
        <div className='ar-arrow-button-img-wrapper up-img-wrapper'>
          <img src={arrowDownImg} alt='' className='img-contain' />
        </div>
      </button>
      <button onClick={clickDown} className='ar-arrow-button mt-10'>
        <div className='ar-arrow-button-img-wrapper down-img-wrapper'>
          <img src={arrowDownImg} alt='' className='img-contain' />
        </div>
      </button>
    </div>
  )
}
const DellButton = ({ click }) => {
  return (
    <button onClick={click} className='ar-trash-button'>
      <div className='ar-trash-button-img-wrapper'>
        <img src={trashImg} alt='' className='img-contain' />
      </div>
    </button>
  )
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^\w\d\-_. ]/g, '').replace(/ /g, '')
}

function generateKeys(articleId) {
  return {
    titleKey: `${articleId}__titleKey`,
    descriptionKey: `${articleId}__descriptionKey`,
    articleKey: `${articleId}__articleKey`,
  }
}

export function clearLocalStorageAfterCreateArticle() {
  const { articleKey, titleKey, descriptionKey } = JSON.parse(
    window.localStorage.getItem('createArticleKey')
  )

  const arrInputsId = JSON.parse(window.localStorage.getItem(articleKey))

  arrInputsId.forEach(({ idInput }) => {
    localStorage.removeItem(idInput)
  })

  localStorage.removeItem(titleKey)
  localStorage.removeItem(descriptionKey)
  localStorage.removeItem(articleKey)
}

export default CreateArticlePage
