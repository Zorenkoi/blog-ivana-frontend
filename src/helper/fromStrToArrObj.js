function fromStrToArrObj(str) {
  const arrIndex1 = sortNum(getArrIndexStart(str))
  const arrIndex2 = sortNum(getArrIndexEnd(str))
  const arrPair3 = makePairFromArraysIndex(arrIndex1, arrIndex2)
  const arrPair4 = makePairFromStrByComplexPair(str, arrPair3)
  const arrObj5 = transformComplexFromPairToObj(str, arrPair3)
  const arrObj6 = transformSimpleFromPairToObj(str, arrPair4)
  const sortedArrObj7 = sortByFirstIndex([...arrObj5, ...arrObj6])

  return sortedArrObj7
}

export default fromStrToArrObj

function getArrIndexStart(str) {
  return [
    ...getArrIndexByRegexFromStr(str, /<b>/),
    ...getArrIndexByRegexFromStr(str, /<k>/),
    ...getArrIndexByRegexFromStr(str, /<i\s+href="([^"]*)">/),
  ]
}
function getArrIndexEnd(str) {
  return [
    ...getArrIndexByRegexFromStr(str, /<\/b>/),
    ...getArrIndexByRegexFromStr(str, /<\/k>/),
    ...getArrIndexByRegexFromStr(str, /<\/i>/),
  ]
}
function getArrIndexByRegexFromStr(inputString, regex) {
  const indices = []
  let startIndex = inputString.search(regex)

  while (startIndex !== -1) {
    indices.push(startIndex)
    startIndex = inputString.indexOf(
      inputString.match(regex)[0],
      startIndex + 1
    )
  }

  return indices
}
function makePairFromArraysIndex(arrStart, arrEnd) {
  const rez = []

  for (let i = 0; i < arrStart.length; i++) {
    const start = arrStart[i]

    for (let j = 0; j < arrEnd.length; j++) {
      const end = arrEnd[j]

      if (end > start) {
        rez.push([start, end])
        break
      }
    }
  }

  return rez
}
function makePairFromStrByComplexPair(str, arrPare) {
  const startText = [0, arrPare[0][0]]
  const endText = [arrPare[lastIndex(arrPare)][1], str.length]
  const arrMiddleText = []

  for (let i = 0; i < arrPare.length - 1; i++) {
    const pare = arrPare[i]
    const nextPare = arrPare[i + 1]

    arrMiddleText.push([pare[1], nextPare[0]])
  }

  return [startText, ...arrMiddleText, endText]
}
function transformSimpleFromPairToObj(str, arrPare) {
  return arrPare.map(([firstIndex, lastIndex]) => {
    let text

    if (firstIndex === 0) {
      text = str.slice(firstIndex, lastIndex)
    } else {
      text = str.slice(firstIndex + 4, lastIndex)
    }
    return {
      typeString: 'simple',
      text,
      firstIndex,
      lastIndex,
    }
  })
}
function transformComplexFromPairToObj(str, arrPare) {
  return arrPare.map(([firstIndex, lastIndex]) => {
    const text = str.slice(firstIndex, lastIndex + 4)
    const typeString = defineTypeString(text)

    return {
      typeString,
      text,
      firstIndex,
      lastIndex,
    }
  })
}
function sortByFirstIndex(arr) {
  const newArr = [...arr]

  newArr.sort((a, b) => a.firstIndex - b.firstIndex)

  return newArr
}
function defineTypeString(str) {
  if (str[1] === 'i') return 'link'
  if (str[1] === 'k') return 'kursive'
  if (str[1] === 'b') return 'bold'
}
function lastIndex(value) {
  return value.length - 1
}
function sortNum(numbers) {
  return numbers.sort((a, b) => a - b)
}
