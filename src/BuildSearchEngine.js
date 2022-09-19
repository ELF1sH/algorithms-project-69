const WORD_REGEXP = /[a-zA-Z]+/g;
const EXTRA_SYMBOLS_REGEXP = /[^a-zA-Z ]+/g;

const getRidOfSymbols = (text) => {
  return text.replace(EXTRA_SYMBOLS_REGEXP, '');
};

const getUnique = (array) => Array.from(new Set(array));

const getInvertedIndex = (docs) => {
  const unitedText = docs.reduce((acc, doc) => `${acc} ${doc.text}`, "");
  const allWords = unitedText.match(WORD_REGEXP);
  const uniqueWords = getUnique(allWords);

  const docsTextArrays = docs.map((doc) => ({ ...doc, text: doc.text.match(WORD_REGEXP) }));
  console.log(docsTextArrays);

  const res = uniqueWords.reduce((acc, word) => ({
    ...acc,
    [word]: docsTextArrays.reduce((acc, doc) => doc.text.includes(word) ? [...acc, doc.id] : acc, []),
  }), {});

  return res;
}

const buildSearchEngine = (docs) => {
  const normalizedDocs = docs.map((doc) => ({ ...doc, text: getRidOfSymbols(doc.text) }));
  const invertedIndex = getInvertedIndex(normalizedDocs);
  console.log(invertedIndex);
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
            .reduce((acc, doc) => [...acc, { [doc.id]: Math.log(1 + (doc.text.match(regExp) || []).length / doc.text.match(WORD_REGEXP).length)} ], []),
        }
      }, {});
      console.log(TFs);

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

const doc1 = { id: 'doc1', text: "I can't shoot straight unless I've had a pint!" };
const doc2 = { id: 'doc2', text: "Don't shoot shoot shoot that thing at me." };
const doc3 = { id: 'doc3', text: "I'm your shooter." };
const docs = [doc1, doc2, doc3];
const searchEngine = buildSearchEngine(docs);
console.log(searchEngine.search('shoot at me, nerd'));

export default buildSearchEngine;