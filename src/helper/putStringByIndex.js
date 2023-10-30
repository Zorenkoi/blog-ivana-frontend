function putStringByIndex(originalString, stringToInsert, index) {
  return (
    originalString.slice(0, index) +
    stringToInsert +
    originalString.slice(index)
  )
}

export default putStringByIndex
