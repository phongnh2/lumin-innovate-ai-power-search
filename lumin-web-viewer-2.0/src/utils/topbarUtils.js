/**
 *
 * @param {string} documentId
 * @param {boolean} isShowTopbar
 */
function saveStateDocumentTopbar(documentId, isShowTopbar) {
  if (isShowTopbar) {
    return localStorage.removeItem(`hide-topbar-${documentId}`);
  }
  return localStorage.setItem(`hide-topbar-${documentId}`, 'hidden');
}

/**
 *
 * @param {string} documentId
 */
function isDocumentTopbarShow(documentId) {
  return !localStorage.getItem(`hide-topbar-${documentId}`);
}

export default { saveStateDocumentTopbar, isDocumentTopbarShow };
