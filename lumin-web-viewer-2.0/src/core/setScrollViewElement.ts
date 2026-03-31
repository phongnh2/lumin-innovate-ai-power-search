/**
 * @see componentDidMount in DocumentContainer.js about how to use this api
 */
export default (docViewer: Core.DocumentViewer, element: Element): void => {
  docViewer.setScrollViewElement(element);
};
