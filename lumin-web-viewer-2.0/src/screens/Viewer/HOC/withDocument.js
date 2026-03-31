import { capitalize } from 'lodash';
import React, { useEffect, useRef, useCallback } from 'react';

import documentGraphServices from 'services/graphServices/documentGraphServices';

import logger from 'helpers/logger';

import { ORGANIZATION_TEXT } from 'constants/organizationConstants';

const withDocument = (WrappedComponent) => {
  const DocumentHOC = ({ ...rest }) => {
    const subcriptionDeleteDocumentRef = useRef(null);
    useEffect(() => () => {
      try {
        if (subcriptionDeleteDocumentRef.current) {
          subcriptionDeleteDocumentRef.current.unsubscribe();
          subcriptionDeleteDocumentRef.current = null;
        }
      } catch (error) {
        logger.logError({
          error,
          reason: `${capitalize(ORGANIZATION_TEXT)} document error`,
        });
      }
    }, []);

    const subcriptDeleteMultipleDocument = useCallback((clientId, handler) => {
      subcriptionDeleteDocumentRef.current = documentGraphServices.subcriptDeleteMultipleDocument({
        clientId,
        callback: handler,
      });
    }, []);

    return <WrappedComponent {...rest} subcriptDeleteMultipleDocument={subcriptDeleteMultipleDocument} />;
  };

  DocumentHOC.defaultProps = {};
  return DocumentHOC;
};
export default withDocument;
