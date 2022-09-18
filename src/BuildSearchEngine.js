const buildSearchEngine = (docs) => {
  return {
    docs,
    search(word) {
      return this.docs.filter((doc) => doc.text.split(' ').includes(word)).map(doc => doc.id);
    },
  };
};

export default buildSearchEngine;