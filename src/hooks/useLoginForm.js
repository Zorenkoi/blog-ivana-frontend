import { useState, useCallback } from 'react'

const useLoginForm = () => {
  const [value, setValue] = useState({
    email: {
      value: '',
      errorMessage: '',
    },
    password: {
      value: '',
      errorMessage: '',
    },
    fullName: {
      value: '',
      errorMessage: '',
    },
  })

  const changeValue = useCallback((e) => {
    const { name, value } = e.target

    setValue((prevValue) => ({
      ...prevValue,
      [name]: { value, errorMessage: checkValue(name, value) },
    }))
  }, [])

  const updateValue = useCallback(() => {
    setValue({
      email: {
        value: '',
        errorMessage: '',
      },
      password: {
        value: '',
        errorMessage: '',
      },
      fullName: {
        value: '',
        errorMessage: '',
      },
    })
  }, [])

  const { email, fullName, password } = value
  return { changeValue, updateValue, email, fullName, password }
}

// Повертая message якщо value не проходить перевірку
function checkValue(key, value) {
  if (key === 'email') {
    return checkEmail(value)
  } else if (key === 'password') {
    return checkPassword(value)
  } else if (key === 'fullName') {
    return checkFullName(value)
  }
}

function checkEmail(email) {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

  if (!email) {
    return 'Email не може бути порожнім'
  }

  if (!emailRegex.test(email)) {
    return 'Не правильний email'
  }

  return ''
}
function checkPassword(password) {
  if (!password) {
    return 'Пароль не може бути порожнім'
  }

  if (password.length < 5) {
    return 'Пароль повинен мати не менше 5 символів'
  }

  return ''
}
function checkFullName(fullName) {
  if (!fullName) {
    return "Ім'я не може бути порожнім"
  }

  if (fullName.length < 3) {
    return "Ім'я повиненно мати не менше 3 символів"
  }

  return ''
}

export default useLoginForm
