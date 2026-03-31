import core from 'core';

export const getPageText = async (pageNumber: number) => {
  const doc = core.getDocument();
  return doc.loadPageText(pageNumber);
};
