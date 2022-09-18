const getRidOfSymbols = (text) => {
  const regExp = new RegExp('(!)|(\\?)|(,)|(\\.)|(\\()|(\\))|(-)|(\')|(")|(\\^)|(_)', 'g');
  return text.replaceAll(regExp, '');
};

const getOccurrencesNumber = (string, substring) => {
  // const regExp = new RegExp(`${substring}`, 'g');
  // return (string.match(regExp) || []).length;
  return string.split(' ').reduce((acc, word) => word === substring ? acc + 1 : acc, 0);
};

const getOccurrencesSum = (string, substringsArray) => {
  const res = substringsArray.reduce((acc, substring) => {
    return acc + getOccurrencesNumber(string, substring);
  }, 0);
  console.log(res);
  return res;
};

const buildSearchEngine = (docs) => ({
  docs: docs.map((doc) => ({ ...doc, text: getRidOfSymbols(doc.text) })),
  search(target) {
    const fixedTarget = getRidOfSymbols(target);
    const fixedTargetArray = fixedTarget.split(' ');
    return this.docs
      .map((doc) => ({ ...doc, count: getOccurrencesSum(doc.text, fixedTargetArray) }))
      .filter((doc) => doc.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((doc) => doc.id);
  },
});

export default buildSearchEngine;
