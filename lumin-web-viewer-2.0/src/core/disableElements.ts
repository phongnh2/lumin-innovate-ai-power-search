/**
 * Unmount multiple elements in the DOM. Note that this ONLY removes the DOM elements without disabling related features.
 * @method WebViewerInstance#disableElements
 * @param {string[]} dataElements Array of data-element attribute values for DOM elements. To find data-element of a DOM element, refer to <a href='https://www.pdftron.com/documentation/web/guides/hiding-elements/#finding-dataelement-attribute-values' target='_blank'>Finding data-element attribute values</a>.
 * @example
WebViewer(...)
  .then(function(instance) {
    // remove left panel and left panel button from the DOM
    instance.disableElements([ 'leftPanel', 'leftPanelButton' ]);
  });
 */
import { Store } from 'redux';

import { PRIORITY_THREE } from 'constants/actionPriority';
import { DataElement } from 'constants/dataElement';

import { disableElement, disableElements } from '../redux/actions/internalActions';

export default (store: Store, dataElements: DataElement[]): void => {
  if (typeof dataElements === 'string') {
    store.dispatch(disableElement(dataElements, PRIORITY_THREE));
  }
  store.dispatch(disableElements(dataElements, PRIORITY_THREE));
};
