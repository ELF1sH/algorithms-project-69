const getRidOfSymbols = (text) => {
  const regExp = new RegExp(`(!)|(\\?)|(,)|(\\.)|(\\()|(\\))|(-)|(')|(")|(\\^)|(_)`, 'g');
  return text.replaceAll(regExp, '');
};

const getOccurrencesNumber = (string, substring) => {
  const regExp = new RegExp(`${substring}`, 'g');
  return (string.match(regExp) || []).length;
};

const buildSearchEngine = (docs) => {
  return {
    docs: docs.map(doc => ({...doc, text: getRidOfSymbols(doc.text)})),
    search(word) {
      const fixedWord = getRidOfSymbols(word);
      return this.docs
        .filter((doc) => doc.text.split(' ').includes(fixedWord))
        .map((doc) => ({...doc, count: getOccurrencesNumber(doc.text, fixedWord)}))
        .sort((a, b) => b.count - a.count)
        .map(doc => doc.id);
    },
  };
};

export default buildSearchEngine;