export const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  const stateToPersist = store.getState() // Получите текущее состояние хранилища
  localStorage.setItem('reduxState', JSON.stringify(stateToPersist)) // Сохраните состояние в localStorage
  return result
}
