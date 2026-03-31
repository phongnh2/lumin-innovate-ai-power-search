/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react-hooks/rules-of-hooks */
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import React, { useState, useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import useDidUpdate from 'hooks/useDidUpdate';

import { addEventHandlers, removeEventHandlers } from 'helpers/eventHandler';
import fireEvent from 'helpers/fireEvent';
import getBackendPromise from 'helpers/getBackendPromise';
import getHashParams from 'helpers/getHashParams';
import loadCustomCSS from 'helpers/loadCustomCSS';
import loadScript from 'helpers/loadScript';
import logDebugInfo from 'helpers/logDebugInfo';
import logger from 'helpers/logger';
import setAutoSwitch from 'helpers/setAutoSwitch';
import setDefaultDisabledElements from 'helpers/setDefaultDisabledElements';
import setDefaultToolStyles from 'helpers/setDefaultToolStyles';
import setupDocViewer from 'helpers/setupDocViewer';
import setUserPermission from 'helpers/setUserPermission';

import defaultTool from 'constants/defaultTool';
import { LOGGER } from 'constants/lumin-common';
import { LOAD_CORE } from 'constants/timeTracking';
import { TOOLS_NAME } from 'constants/toolsName';
import { workerTypes } from 'constants/types';

import DebugViewer from './debug-viewer';
import timeTracking from './time-tracking';
import { store } from '../../redux/store';
import { setWebViewerPaths, getPDFNetPath } from '../../utils/corePathHelper';

// eslint-disable-next-line sonarjs/cognitive-complexity
const ViewerHOC =
  (WrapperComponent, ...rest) =>
  (props) => {
    const [isLoading, setLoading] = useState(true);
    const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
    const state = store.getState();
    const documentStorage = currentDocument?.service;
    const { documentId: documentIdParam } = useParams();

    useEffect(() => {
      const initializeCore = async () => {
        if (window.CanvasRenderingContext2D && (window.Core || !isEmpty(core.CoreControls)) && isLoading) {
          timeTracking.register(LOAD_CORE);
          const CoreControls = window.Core || core.CoreControls;
          let fullAPIReady = Promise.resolve();
          await setWebViewerPaths(CoreControls);

          if (state.advanced.fullAPI && !window.Core.isFullPDFEnabled()) {
            CoreControls.enableFullPDF();
            const pdfNetPath = await getPDFNetPath();
            fullAPIReady = loadScript(pdfNetPath);
          }

          if (getHashParams('disableLogs', false)) {
            CoreControls.disableLogs(true);
          }

          try {
            if (state.advanced.useSharedWorker && window.parent.WebViewer) {
              const workerTransportPromise = window.parent.WebViewer.workerTransportPromise(window.frameElement);
              // originally the option was just for the pdf worker transport promise, now it can be an object
              // containing both the pdf and office promises
              if (workerTransportPromise.pdf || workerTransportPromise.office) {
                CoreControls.setWorkerTransportPromise(workerTransportPromise);
              } else {
                CoreControls.setWorkerTransportPromise({
                  pdf: workerTransportPromise,
                });
              }
            }
          } catch (e) {
            if (e.name === 'SecurityError') {
              logger.logInfo({
                message: JSON.stringify(e),
                reason: LOGGER.Service.PDFTRON,
              });
            } else {
              logger.logInfo({
                message: 'workerTransportPromise option cannot be used with CORS',
                reason: LOGGER.Service.PDFTRON,
              });
            }
          }

          const { preloadWorker } = state.advanced;

          const initTransports = () => {
            const { PDF, OFFICE, ALL } = workerTypes;
            if (preloadWorker === PDF || preloadWorker === ALL) {
              getBackendPromise(getHashParams('pdf', 'auto')).then((pdfType) => {
                CoreControls.initPDFWorkerTransports(
                  pdfType,
                  {
                    workerLoadingProgress: (percent) => {
                      store.dispatch(actions.setWorkerLoadingProgress(percent));
                    },
                  },
                  process.env.PDFTRON_LICENSE_KEY
                );
              });
            }

            if (preloadWorker === OFFICE || preloadWorker === ALL) {
              getBackendPromise(getHashParams('office', 'auto')).then((officeType) => {
                CoreControls.initOfficeWorkerTransports(
                  officeType,
                  {
                    workerLoadingProgress: (percent) => {
                      store.dispatch(actions.setWorkerLoadingProgress(percent));
                    },
                  },
                  process.env.PDFTRON_LICENSE_KEY
                );
              });
            }
          };

          loadCustomCSS(state.advanced.customCSS);

          if (isEmpty(core.docViewer)) {
            const docViewer = new CoreControls.DocumentViewer();
            core.docViewer = docViewer;
          }
          core.CoreControls = CoreControls;
          core.enableRedaction();
          window.lumin_core_debug = function debug(key) {
            return new DebugViewer(key, core.docViewer, cloneDeep(CoreControls));
          };
          logDebugInfo(state.advanced);
          setupDocViewer();
          setUserPermission(state);
          setAutoSwitch();
          core.setToolMode(defaultTool);
          setLoading(true);
          fullAPIReady
            .then(() =>
              loadScript(
                state.advanced.configScript,
                'Config script could not be loaded. The default configuration will be used.'
              )
            )
            .then(async () => {
              if (preloadWorker) {
                initTransports();
              }
              await window.Core.PDFNet.initialize(process.env.PDFTRON_LICENSE_KEY);
              core.isInitialized = true;
              fireEvent('coreLoaded');
              timeTracking.finishTracking(LOAD_CORE);
              setDefaultDisabledElements(store);
              setDefaultToolStyles();
              setLoading(false);
            });
          addEventHandlers(false);
        }
        return () => {
          core.getTool(TOOLS_NAME.SIGNATURE).clearPreviewSignatureElement?.();
          removeEventHandlers(false);
        };
      };

      initializeCore();
    }, [documentIdParam]);

    useDidUpdate(() => {
      if (documentStorage) {
        setupDocViewer();
        removeEventHandlers(false);
        addEventHandlers(false);
      }
      return () => {
        if (documentStorage) {
          core.getTool(TOOLS_NAME.SIGNATURE).clearPreviewSignatureElement?.();
          removeEventHandlers(false);
        }
      };
      /*
      FIX LMV-3624
      When we convert Drive file to Lumin file, Document container is re-mounted and lost event listeners which relate to showing preview signature.
    */
    }, [documentStorage, documentIdParam]);

    return <WrapperComponent {...rest} {...props} isLoadingCore={isLoading} />;
  };

export default ViewerHOC;
