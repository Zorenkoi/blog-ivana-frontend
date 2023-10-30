import { useState } from 'react'

// Кастомный хук для работы с localStorage
function useLocalStorage(key, initialValue) {
  // Используем useState для инициализации состояния и его обновления
  const [storedValue, setStoredValue] = useState(() => {
    // Пытаемся получить значение из localStorage по ключу
    const item = window.localStorage.getItem(key)
    // Если значение существует, парсим его и возвращаем
    if (!!item) {
      return JSON.parse(item)
    } else {
      window.localStorage.setItem(key, JSON.stringify(initialValue))
      return initialValue
    }
  })

  // Функция для установки значения в localStorage
  const setValue = (value) => {
    // Сохраняем значение в state
    setStoredValue(value)
    // Сохраняем значение в localStorage по ключу
    if (typeof value === 'function') {
    } else {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
