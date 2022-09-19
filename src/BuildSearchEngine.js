const WORD_REGEXP = /([a-zA-Z]+)|([0-9]+)/g;
const EXTRA_SYMBOLS_REGEXP = /[^a-zA-Z0-9 ]+/g;

// ------------------------
// functions-helpers block *BEGINNING*
// ------------------------
const getRidOfSymbols = (text) => {
  const text1 = text.replace(/\n/g, ' ');
  return text1.replace(EXTRA_SYMBOLS_REGEXP, '');
};

const getUnique = (array) => Array.from(new Set(array));

const getInvertedIndex = (docs) => {
  const unitedText = docs.reduce((acc, doc) => `${acc} ${doc.text}`, '');
  const allWordsArray = unitedText.match(WORD_REGEXP);
  const uniqueWordsArray = getUnique(allWordsArray);

  const docsTextArrays = docs.map((doc) => ({ ...doc, text: doc.text.match(WORD_REGEXP) }));

  return uniqueWordsArray.reduce((acc, word) => ({
    ...acc,
    [word]: docsTextArrays.reduce((acc, doc) => (
      doc.text.includes(word) ? [...acc, doc.id] : acc
    ), []),
  }), {});
};

const calculateTF = (docText, targetWordRegExp) => {
  const targetWordsInText = (docText.match(targetWordRegExp) || []).length;
  const wordsInText = docText.match(WORD_REGEXP).length;
  return targetWordsInText / wordsInText;
};

const calculateIDF = (docsNumber, invertedIndex, targetWord) => {
  let currentIDF = docsNumber / (invertedIndex[targetWord] ? invertedIndex[targetWord].length : 0);
  if (!isFinite(currentIDF)) {
    currentIDF = 0;
  }
  return currentIDF;
};

const getTF = (TFs, targetWord, docId) => (
  TFs[targetWord].find((value) => Object.keys(value)[0] === docId)[docId]
);

const findSumTFIDFbyDocId = (TFIDF, docId) => (
  Object.values(TFIDF).reduce((acc, targetWordDocs) => (
    acc + targetWordDocs.find((value) => Object.keys(value)[0] === docId)[docId]
  ), 0)
);
// ------------------------
// functions-helpers block *ENDING*
// ------------------------

// ------------------------
// buildSearchEngine
// ------------------------
const buildSearchEngine = (docs) => {
  const normalizedDocs = docs.map((doc) => ({
    ...doc,
    text: getRidOfSymbols(doc.text.toLowerCase()),
  }));
  const invertedIndex = getInvertedIndex(normalizedDocs);

  return {
    search(target) {
      if (!target) {
        return [];
      }
      const normalizedTarget = getRidOfSymbols(target);
      const normalizedTargetArray = normalizedTarget.match(WORD_REGEXP);

      const TFs = normalizedTargetArray.reduce((acc, targetWord) => {
        const regExp = new RegExp(`(?<![a-zA-Z])${targetWord}(?![a-zA-Z])`, 'g');
        return {
          ...acc,
          [targetWord]: normalizedDocs.reduce((acc, doc) => (
            [...acc, { [doc.id]: calculateTF(doc.text, regExp) }]
          ), []),
        }
      }, {});

      const IDF = normalizedTargetArray.reduce((acc, targetWord) => {
        let currentIDF = calculateIDF(docs.length, invertedIndex, targetWord);
        return {
          ...acc,
          [targetWord]: Math.log(1 + currentIDF),
        }
      }, {});

      const TFIDF = normalizedTargetArray.reduce((acc, targetWord) => {
        return {
          ...acc,
          [targetWord]: normalizedDocs.reduce((acc, doc) => (
            [...acc, { [doc.id]: getTF(TFs, targetWord, doc.id) * IDF[targetWord] }]
          ), []),
        }
      }, {});

      const res = normalizedDocs.reduce((acc, doc) => (
        [...acc, [doc.id, findSumTFIDFbyDocId(TFIDF, doc.id)]]
      ), []);

      return res
        .filter((item) => item[1] > 0)  // sum bigger than 0
        .sort((a, b) => b[1] - a[1])    // sort by desc
        .map((item) => item[0]);        // get rid of sums leaving only IDs
    },
  };
};

export default buildSearchEngine;
