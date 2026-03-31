import differenceWith from 'lodash/differenceWith';
import PropTypes from 'prop-types';
import React, {
  useState, useEffect, useCallback,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useForwardOfflineDocuments } from 'hooks/useForwardOfflineDocuments';
import { useSearchOffline } from 'hooks/useSearchOffline';

import indexedDBService from 'services/indexedDBService';

import { makeCancelable } from 'utils/makeCancelable';

import { STORAGE_TYPE } from 'constants/lumin-common';

import Handler from './Handler/Handler';

import { cachingFileHandler } from '.';

const OfflineStorageHOC = (WrappedComponent) => {
  function HOC(props) {
    const isOffline = useSelector(selectors.isOffline);
    const [cloudDocuments, setCloudDocuments] = useState([]);
    const [cloudLoading, setCloudLoading] = useState(true);
    const canForward = useForwardOfflineDocuments();

    const getOfflineDocumentList = useCallback(() => {
      const { promise, cancel } = makeCancelable(async () => {
        const cachingDocuments = cachingFileHandler.data.map((document) => ({
          ...document,
          service: STORAGE_TYPE.CACHING,
          onlineService: STORAGE_TYPE.S3,
        }));
        let documents = [...cachingDocuments];
        if (canForward) {
          const cloudDocuments = await indexedDBService.getCloudDocList();
          const interceptDocuments = differenceWith(
            cloudDocuments.cloudList,
            cachingDocuments,
            (origin, caching) => origin._id === caching._id
          );
          documents = [...documents, ...interceptDocuments];
        }
        return documents;
      });
      promise().then((data) => {
        unstable_batchedUpdates(() => {
          setCloudDocuments(data);
          setCloudLoading(false);
        });
      });
      return cancel;
    }, [canForward]);

    const searchProps = useSearchOffline({
      setCloudDocuments,
      setCloudLoading,
      cachingDocuments: cachingFileHandler.data,
      getOfflineDocumentList,
    });

    useEffect(() => {
      cachingFileHandler.addEventListener(Handler.DELETE, (documentId) =>
        setCloudDocuments((prev) => prev.filter(({ _id }) => _id !== documentId))
      );
      return () => {
        cachingFileHandler.removeAllEventListener();
      };
    }, []);

    useEffect(() => {
      if (isOffline) {
        getOfflineDocumentList();
      } else {
        setCloudDocuments([]);
        setCloudLoading(false);
      }
    }, [isOffline, getOfflineDocumentList]);

    return (
      <WrappedComponent
        isOfflineStorageLoading={cloudLoading}
        documentListOffline={cloudDocuments}
        isOffline={isOffline}
        {...props}
        {...searchProps}
      />
    );
  }

  HOC.propTypes = {
    searchKey: PropTypes.string,
  };
  HOC.defaultProps = {
    searchKey: undefined,
  };

  return HOC;
};

export default OfflineStorageHOC;
