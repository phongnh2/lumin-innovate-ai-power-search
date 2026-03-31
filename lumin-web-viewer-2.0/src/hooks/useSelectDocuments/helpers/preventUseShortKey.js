export default () => {
  if (!document.activeElement || document.activeElement.tagName === 'BODY') {
    return false;
  }
  const documentListDOM = document.getElementById('document-list-root');
  if (documentListDOM) {
    return !documentListDOM.contains(document.activeElement);
  }
};
