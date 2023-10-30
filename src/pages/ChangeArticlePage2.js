import { useState, useEffect, useRef } from 'react'
import uniqid from 'uniqid'
import axios from '../axios'
import { useHistory, useParams } from 'react-router-dom'
import { useCheckAuth } from '../hooks/useCheckAuth'
import arrowDownImg from '../images/arrow-down.png'
import trashImg from '../images/trash.png'

import '../styles/createArticle.css'

const ChangeArticlePage2 = () => {
  const isLogin = useCheckAuth()
  const history = useHistory()
  if (!isLogin) history.push('/')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [arrInputs, setArrInputs] = useState([])

  const changeTitle = (e) => setTitle(e.target.value)
  const changeDescription = (e) => setDescription(e.target.value)

  const { id: articleId } = useParams()

  useEffect(() => {
    axios
      .get(`/articles/${articleId}`)
      .then((response) => {
        const { description, title, arrElementsJson } = response.data.article
        let arrInputs = JSON.parse(arrElementsJson)

        arrInputs = arrInputs.map((inputObj) => {
          const { idContent, typeContent, order, value } = inputObj

          return {
            idInput: idContent,
            typeContent,
            order,
            value,
          }
        })

        setTitle(title)
        setDescription(description)
        setArrInputs(arrInputs)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const getArrImgFileNames = (arrInputs) => {
    const arrImgInputs = arrInputs.filter(
      (input) => input.typeContent === 'img'
    )
    return arrImgInputs.map((imgInput) => imgInput.value.fileName)
  }

  const updateArticle = (payload) => {
    axios
      .patch(`/articles/${articleId}`, payload)
      .then((response) => {
        history.push(`/articles/${articleId}`)
      })
      .catch((err) => {
        console.log(err.response)
      })
  }

  const clickSubmit = () => {
    const arrImgFileNames = getArrImgFileNames(arrInputs)

    const _arrInputs = arrInputs.map((inputObj) => {
      return { ...inputObj, idContent: inputObj.idInput }
    })

    const arrElementsJson = JSON.stringify(_arrInputs)

    const payload = {
      title,
      description,
      arrElementsJson,
      arrImgFileNames,
    }

    updateArticle(payload)
  }
  ///////////////////////////////////////////////////////////////

  return (
    <div className='create-article-wrapper'>
      <div className='title mb-20'>Змінити статтю</div>

      <div className='ar-label'>Заголовок:</div>
      <input
        value={title}
        onChange={changeTitle}
        type='text'
        className='ar-title-input mb-20'
      />

      <div className='ar-label'>Опис статті:</div>
      <textarea
        value={description}
        onChange={changeDescription}
        className='ar-textarea mb-20'
      ></textarea>

      <Block arrInputs={arrInputs} setArrInputs={setArrInputs} />

      <div className='main-buttons-container'>
        <button onClick={clickSubmit} className='button ml-20'>
          зберегти зміни
        </button>
      </div>
    </div>
  )
}
//////////////////////////////////////////////////////////////////////

const Block = ({ arrInputs, setArrInputs }) => {
  console.log(arrInputs)
  const addInput = (typeContent) => {
    const value = getInitialValue(typeContent)
    const newInput = {
      typeContent,
      idInput: uniqid(),
      order: arrInputs.length,
      value,
    }

    setArrInputs((prevInputs) => {
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

      return newInputs
    })
  }
  const getInputActions = (idInput, order) => {
    return {
      inputUp: () => inputUp(idInput, order),
      inputDown: () => inputDown(idInput, order),
      removeInput: (beforeDieF) => removeInput(idInput, order, beforeDieF),
      setValue: (newValue) => {
        setArrInputs((prevInputs) => {
          const newInputs = prevInputs.map((input) => {
            if (input.idInput === idInput) {
              return { ...input, value: newValue }
            }

            return input
          })

          return newInputs
        })
      },
    }
  }

  const sortedArrInputs = arrInputs.sort((a, b) => a.order - b.order)
  return (
    <div className='ar-block mb-30'>
      <div className='column'>
        {sortedArrInputs.map(({ typeContent, idInput, order, value }) => {
          const inputActions = getInputActions(idInput, order)
          return (
            <ShowInput
              key={idInput}
              typeContent={typeContent}
              idInput={idInput}
              order={order}
              inputActions={inputActions}
              value={value}
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

const ShowInput = ({ typeContent, idInput, inputActions, order, value }) => {
  switch (typeContent) {
    case 'subtitle':
      return (
        <Input
          key={idInput}
          idInput={idInput}
          inputActions={inputActions}
          order={order}
          value={value}
        />
      )
    case 'plaintext':
      return (
        <TextArea
          key={idInput}
          idInput={idInput}
          inputActions={inputActions}
          order={order}
          value={value}
        />
      )
    case 'list':
      return (
        <InputList
          key={idInput}
          idInput={idInput}
          inputActions={inputActions}
          order={order}
          value={value}
        />
      )

    case 'img':
      return (
        <InputImg
          key={idInput}
          idInput={idInput}
          inputActions={inputActions}
          order={order}
          value={value}
        />
      )

    default:
      break
  }
}

const TextArea = ({ idInput, inputActions, value, order }) => {
  const textareaRef = useRef(null)
  const [textareaHeight, setTextareaHeight] = useState('auto')

  const { inputUp, inputDown, removeInput, setValue } = inputActions

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
const Input = ({ idInput, inputActions, value, order }) => {
  const { setValue, inputUp, inputDown, removeInput } = inputActions
  // const [value, setValue] = useState(initialValue)
  const changeValue = (e) => setValue(e.target.value)

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
const InputList = ({ idInput, inputActions, value, order }) => {
  console.log(value.items)
  const { inputUp, inputDown, removeInput, setValue } = inputActions

  const changeTitleList = (e) => {
    const newValue = { ...value, titleList: e.target.value }
    // setValue((prevValue) => {
    //   const newValue = {
    //     ...prevValue,
    //     titleList: e.target.value,
    //   }

    //   setValue(newValue)
    //   return newValue
    // })
    setValue(newValue)
  }

  const addItem = () => {
    // setValue((prevValue) => {
    //   const newValue = {
    //     ...prevValue,
    //     items: [...prevValue.items, { itemId: uniqid(), itemText: '' }],
    //   }

    //   setValue(newValue)
    //   return newValue
    // })
    const newValue = {
      ...value,
      items: [...value.items, { itemId: uniqid(), itemText: '' }],
    }
    setValue(newValue)
  }
  const removeItem = (itemId) => {
    const newValue = {
      ...value,
      items: value.items.filter((item) => item.itemId !== itemId),
    }
    setValue(newValue)
  }

  const changeItem = (e, itemId) => {
    const newValue = {
      ...value,
      items: value.items.map((item) => {
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
  }

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
const InputImg = ({ idInput, inputActions, value, order }) => {
  const { inputUp, inputDown, removeInput, setValue } = inputActions

  const changeImgName = (e) => {
    const newImgName = e.target.value

    setValue({ ...value, imgName: newImgName })
  }
  const changeFileName = (newFileName) => {
    setValue({ ...value, fileName: newFileName })
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
    if (!!value.fileName) {
      deleteImgFromDb(value.fileName)
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

function getInitialValue(typeContent) {
  if (typeContent === 'subtitle') {
    return ''
  }
  if (typeContent === 'plaintext') {
    return ''
  }
  if (typeContent === 'list') {
    return {
      titleList: '',
      items: [{ itemId: uniqid(), itemText: '' }],
    }
  }
  if (typeContent === 'img') {
    return {
      fileName: '',
      imgName: '',
    }
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

export default ChangeArticlePage2
