const WORD_REGEXP = /([a-zA-Z]+)|([0-9]+)/g;
const EXTRA_SYMBOLS_REGEXP = /[^a-zA-Z0-9 ]+/g;

const getRidOfSymbols = (text) => {
  const text1 = text.replace(/\n/g, ' ');
  return text1.replace(EXTRA_SYMBOLS_REGEXP, '');
};

const getUnique = (array) => Array.from(new Set(array));

const getInvertedIndex = (docs) => {
  const unitedText = docs.reduce((acc, doc) => `${acc} ${doc.text}`, "");
  const allWords = unitedText.match(WORD_REGEXP);
  const uniqueWords = getUnique(allWords);

  const docsTextArrays = docs.map((doc) => ({ ...doc, text: doc.text.match(WORD_REGEXP) }));

  return uniqueWords.reduce((acc, word) => ({
    ...acc,
    [word]: docsTextArrays.reduce((acc, doc) => doc.text.includes(word) ? [...acc, doc.id] : acc, []),
  }), {});
}

// ------------------------
// buildSearchEngine
// ------------------------
const buildSearchEngine = (docs) => {
  const normalizedDocs = docs.map((doc) => ({ ...doc, text: getRidOfSymbols(doc.text.toLowerCase()) }));
  const invertedIndex = getInvertedIndex(normalizedDocs);
  return {
    search(target) {
      if (!target) {
        return [];
      }
      const normalizedTarget = getRidOfSymbols(target);
      if (normalizedTarget === null) {
        return [];
      }
      const normalizedTargetArray = normalizedTarget.match(WORD_REGEXP);

      const TFs = normalizedTargetArray.reduce((acc, targetWord) => {
        const regExp = new RegExp(`(?<![a-zA-Z])${targetWord}(?![a-zA-Z])`, 'g');
        return {
          ...acc,
          [targetWord]: normalizedDocs
            .reduce((acc, doc) => [...acc, { [doc.id]: (doc.text.match(regExp) || []).length / doc.text.match(WORD_REGEXP).length} ], []),
        }
      }, {});

      const IDF = normalizedTargetArray.reduce((acc, targetWord) => {
        let currentIDF = docs.length / (invertedIndex[targetWord] ? invertedIndex[targetWord].length : 0);
        if (!isFinite(currentIDF)) {
          currentIDF = 0;
        }
        return {
          ...acc,
          [targetWord]: Math.log(1 + currentIDF),
        }
      }, {});

      const TFIDF = normalizedTargetArray.reduce((acc, targetWord) => {
        return {
          ...acc,
          [targetWord]: normalizedDocs.reduce((acc, doc) => [...acc, { [doc.id]: TFs[targetWord].find(value => Object.keys(value)[0] === doc.id)[doc.id] * IDF[targetWord] }], []),
        }
      }, {});

      const res = normalizedDocs.reduce((acc, doc) => {
        return [
          ...acc,
          [doc.id, Object.values(TFIDF).reduce((acc, targetWord) => acc + targetWord.find(value => Object.keys(value)[0] === doc.id)[doc.id], 0)],
        ]
      }, []);

      return res
        .filter((item) => item[1] > 0)
        .sort((a, b) => b[1] - a[1])
        .map((item) => item[0])
    },
  };

};

export default buildSearchEngine;
