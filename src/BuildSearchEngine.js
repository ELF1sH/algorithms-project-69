const getRidOfSymbols = (text) => {
  const regExp = new RegExp(`(!)|(\\?)|(,)|(\\.)|(\\()|(\\))|(-)|(')|(")|(\\^)|(_)`, 'g');
  return text.replaceAll(regExp, '');
}

const buildSearchEngine = (docs) => {
  return {
    docs: docs.map(doc => ({...doc, text: getRidOfSymbols(doc.text)})),
    search(word) {
      const fixedWord = getRidOfSymbols(word);
      return this.docs
        .filter((doc) => doc.text.split(' ')
        .includes(fixedWord))
        .map(doc => doc.id);
    },
  };
};

export default buildSearchEngine;