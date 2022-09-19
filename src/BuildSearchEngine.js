const WORD_REGEXP = /[a-zA-Z]+/g;
const EXTRA_SYMBOLS_REGEXP = /(!)|(\?)|(,)|(\.)|(\()|(\))|(-)|(')|(")|(\^)|(_)/g;

const getRidOfSymbols = (text) => {
  return text.replace(EXTRA_SYMBOLS_REGEXP, '');
};

const getOccurrencesNumber = (string, substring) => (
  string.split(' ').reduce((acc, word) => word === substring ? acc + 1 : acc, 0));

const getOccurrencesSum = (string, substringsArray) => {
  const res = substringsArray.reduce((acc, substring) => {
    return acc + getOccurrencesNumber(string, substring);
  }, 0);

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

  const res = uniqueWords.reduce((acc, word) => ({
    ...acc,
    [word]: docsTextArrays.reduce((acc, doc) => doc.text.includes(word) ? [...acc, doc.id] : acc, []),
  }), {});

  return res;
}

const buildSearchEngine = (docs) => {
  const normalizedDocs = docs.map((doc) => ({ ...doc, text: getRidOfSymbols(doc.text) }));
  const invertedIndex = getInvertedIndex(docs);
  console.log(invertedIndex);
  return {
    // search(target) {
    //   const targetArray = getUnique(getRidOfSymbols(target).match(WORD_REGEXP));
    //   console.log(targetArray);
    //
    //   const docOccurrencesNumbers = normalizedDocs.reduce((acc, doc) => ([
    //     ...acc,
    //     {
    //       [doc.id]: targetArray.reduce((acc, word) => invertedIndex[word]?.includes(doc.id) ? acc + 1 : acc, 0),
    //     },
    //   ]), []);
    //   console.log(docOccurrencesNumbers);
    //   // const docOccurrencesNumbersArray = docOccurrencesNumbers.reduce((acc, doc) => [doc], [])
    //   return docOccurrencesNumbers
    //     .filter((doc) => Object.values(doc)[0] > 0)
    //     .sort((a, b) => Object.values(b)[0] - Object.values(a)[0])
    //     .map((doc) => Object.keys(doc)[0]);
    // },
    search(target) {
      const normalizedTarget = getRidOfSymbols(target);
      const normalizedTargetArray = normalizedTarget.match(WORD_REGEXP);

      const TFs = normalizedTargetArray.reduce((acc, targetWord) => {
        const regExp = new RegExp(`(?<![a-zA-Z])${targetWord}(?![a-zA-Z])`, 'g');
        return {
          ...acc,
          [targetWord]: normalizedDocs
            .reduce((acc, doc) => [...acc, { [doc.id]: (doc.text.match(regExp) || []).length / doc.text.length} ], [])
        }
      }, {});
      console.log(TFs);

      const IDF = normalizedTargetArray.reduce((acc, targetWord) => {
        return {
          ...acc,
          [targetWord]: Math.log10(docs.length / invertedIndex[targetWord].length)
        }
      }, {});
      console.log(IDF);

      const TFIDF = normalizedTargetArray.reduce((acc, targetWord) => {
        return {
          ...acc,
          [targetWord]: normalizedDocs.reduce((acc, doc) => [...acc, { [doc.id]: TFs[targetWord].find(value => Object.keys(value)[0] === doc.id)[doc.id] * IDF[targetWord] }], []),
        }
      }, {});

      console.log(TFIDF);

      const res = normalizedDocs.reduce((acc, doc) => {
        return [
          ...acc,
          [doc.id, Object.values(TFIDF).reduce((acc, targetWord) => acc + targetWord.find(value => Object.keys(value)[0] === doc.id)[doc.id], 0)],
        ]
      }, []);
      console.log(res);
      const res1 = res
        .filter((item) => item[1] > 0)
        .sort((a, b) => b[1] - a[1])
        .map((item) => item[0])
      console.log(res1);
      return res1;
    },
  };

};

// const doc1 = { id: 'doc1', text: "I can't shoot straight unless I've had a pint!" };
// const doc2 = { id: 'doc2', text: "Don't shoot shoot shoot that thing at me." };
// const doc3 = { id: 'doc3', text: "I'm your shooter." };
// const docs = [doc1, doc2, doc3];
// const searchEngine = buildSearchEngine(docs);
// console.log(searchEngine.search('shoot at me'));

export default buildSearchEngine;