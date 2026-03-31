/**
 * Disable certain features in the WebViewer UI.
 * @method WebViewerInstance#disableFeatures
 * @param {Array.<string>} features Array of features to disable.
 * @see WebViewerInstance#Feature
 * @example
WebViewer(...)
  .then(function(instance) {
    instance.disableFeatures(instance.Feature.Measurement);
  });
 */

import { Store } from 'redux';

import createFeatureAPI from 'helpers/createFeatureAPI';

import { DataElement } from 'constants/dataElement';

const enable = false;
export default (store: Store): ((features: DataElement[] | DataElement) => void) => createFeatureAPI(enable, store);
