import core from 'core';

export default (store) => (pageNumber) => {
  /*
    TEMPORARY FIX CORE VERSION 10.2.3: Cannot double click freetext annotation to edit when user update zoom level
  */
  const pageWidgetContainer = document.getElementById(`pageWidgetContainer${pageNumber}`);
  if (pageWidgetContainer) {
    core
      .getAnnotationsList()
      .filter((annot) => annot.PageNumber === pageNumber && annot instanceof window.Core.Annotations.FreeTextAnnotation)
      .forEach((annot) => {
        const annotEditor = annot.getEditor()?.editor.container;
        if (annotEditor && !pageWidgetContainer.contains(annotEditor)) {
          pageWidgetContainer.appendChild(annotEditor);
        }
      });
  }
  /* END */
  const state = store.getState();
  if (state.viewer.isAccessibleMode) {
    core.getDocument().loadPageText(pageNumber, (text) => {
      const textContainer = document.createElement('div');
      textContainer.tabIndex = 0;
      textContainer.textContent = `Page ${pageNumber + 1}.\n${text}\nEnd of page ${pageNumber + 1}.`;
      textContainer.style = 'font-size: 5px; overflow: auto; position: relative; z-index: -99999';
      const id = `pageText${pageNumber}`;
      textContainer.id = id;
      // remove duplicate / pre-existing divs first before appending again
      const pageContainerElement = document.getElementById(`pageContainer${pageNumber}`);
      const existingTextContainer = pageContainerElement.querySelector(`#${id}`);
      if (existingTextContainer) {
        pageContainerElement.removeChild(existingTextContainer);
      }
      pageContainerElement.appendChild(textContainer);
    });
  }
};
