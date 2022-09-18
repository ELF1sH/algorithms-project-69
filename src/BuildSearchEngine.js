const WORD_REGEXP = /[a-zA-Z]+/g;
const EXTRA_SYMBOLS_REGEXP = /(!)|(\?)|(,)|(\.)|(\()|(\))|(-)|(')|(")|(\^)|(_)/g;

const getRidOfSymbols = (text) => {
  return text.replaceAll(EXTRA_SYMBOLS_REGEXP, '');
};

const getOccurrencesNumber = (string, substring) => (
  string.split(' ').reduce((acc, word) => word === substring ? acc + 1 : acc, 0));

const getOccurrencesSum = (string, substringsArray) => {
  const res = substringsArray.reduce((acc, substring) => {
    return acc + getOccurrencesNumber(string, substring);
  }, 0);
  console.log(res);
  return res;
};

const getOccurrencesNumberInArray = (array, element) => (
  array.reduce((acc, arrElem) => arrElem === element ? acc + 1 : acc, 0));

const getUnique = (array) => Array.from(new Set(array));

const getInvertedIndex = (docs) => {
  const unitedText = docs.reduce((acc, doc) => `${acc} ${doc.text}`, "");
  const allWords = unitedText.match(WORD_REGEXP);
  const uniqueWords = getUnique(allWords);

  const docsTextArrays = docs.map((doc) => ({ ...doc, text: doc.text.match(WORD_REGEXP) }));
  console.log('-------');
  console.log(docsTextArrays);

  const res = uniqueWords.reduce((acc, word) => ({
    ...acc,
    [word]: docsTextArrays.reduce((acc, doc) => doc.text.includes(word) ? [...acc, doc.id] : acc, []),
  }), {});
  console.log(res);
  return res;
}

const buildSearchEngine = (docs) => {
  const normalizedDocs = docs.map((doc) => ({ ...doc, text: getRidOfSymbols(doc.text) }));
  const invertedIndex = getInvertedIndex(docs);

  return {
    search(target) {
      const targetArray = getUnique(getRidOfSymbols(target).match(WORD_REGEXP));
      console.log(targetArray);

      const docOccurrencesNumbers = normalizedDocs.reduce((acc, doc) => ([
        ...acc,
        {
          [doc.id]: targetArray.reduce((acc, word) => invertedIndex[word]?.includes(doc.id) ? acc + 1 : acc, 0),
        },
      ]), []);
      console.log(docOccurrencesNumbers);
      // const docOccurrencesNumbersArray = docOccurrencesNumbers.reduce((acc, doc) => [doc], [])
      return docOccurrencesNumbers
        .filter((doc) => Object.values(doc)[0] > 0)
        .sort((a, b) => Object.values(b)[0] - Object.values(a)[0])
        .map((doc) => Object.keys(doc)[0]);
    },
  };
};

export default buildSearchEngine;
