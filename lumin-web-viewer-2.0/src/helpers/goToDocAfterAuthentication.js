export default () => {
  const targetDocumentURL = sessionStorage.getItem('targetDocumentURL');
  if (targetDocumentURL) {
    window.location.href = targetDocumentURL;
    sessionStorage.remove('targetDocumentURL');
  }
};
