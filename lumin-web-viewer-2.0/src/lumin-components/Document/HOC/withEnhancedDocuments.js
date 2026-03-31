import React, {
  useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {
  connect, useDispatch,
} from 'react-redux';
import { useLocation } from 'react-router';

import selectors from 'selectors';
import actions from 'actions';
import { withOffline } from 'HOC/OfflineStorageHOC';
import { withSystemStorage } from 'HOC/SystemStorageHOC';
import { indexedDBService } from 'services';
import { folderType } from 'constants/documentConstants';
import { useFolderPathMatch, usePrevious, useGetFolderType } from 'hooks';
import withQuery from './withQuery';

const DocumentPropsTransformer = ({
  children, isOffline, isOfflineStorageLoading, documentListOffline, ...rest
}) => {
  const isFolderPage = useFolderPathMatch();
  const prevSearchKey = usePrevious(rest.searchKey);
  const currentFolderType = useGetFolderType();
  const interceptProps = () => {
    if (isOffline && currentFolderType !== folderType.DEVICE) {
      const documentProps = isFolderPage ? {
        folderDocumentProps: {
          prevSearchKey,
          loading: isOfflineStorageLoading,
          documentList: documentListOffline,
          hasNextPage: false,
          total: documentListOffline.length,
          fetchMore: () => {},
          refetch: () => {},
          setDocumentList: () => {},
        },
      } : {
        queryProps: {
          loading: isOfflineStorageLoading,
          documentList: documentListOffline,
          hasNextPage: false,
          fetchMore: () => {},
          refetch: () => {},
          total: documentListOffline.length,
        },
      };

      return {
        ...rest,
        ...documentProps,
      };
    }

    return rest;
  };
  const props = interceptProps();
  return children(props);
};

const withEnhancedDocuments = (Component) => {
  function HOC(props) {
    const { isOffline } = props;
    const location = useLocation();
    const dispatch = useDispatch();
    const isFolderPage = useFolderPathMatch();
    const currentFolderType = useGetFolderType();

    const { pathname } = location;

    const EnhancedComponent = useMemo(() => {
      const getOnlineHOC = !isFolderPage ? withQuery : (Component) => Component;
      const getHOC = isOffline ? withOffline : getOnlineHOC;
      const hocWrapper = currentFolderType === folderType.DEVICE ? withSystemStorage : getHOC;
      return hocWrapper(DocumentPropsTransformer);
    }, [isOffline, isFolderPage, currentFolderType]);

    useEffect(() => {
      if (!isOffline) {
        indexedDBService.setOfflineDocumentListInfo({
          lastUrl: pathname,
        }, false);
        dispatch(actions.updateCurrentUser({
          lastDocumentListUrl: pathname,
        }));
      }
    }, [isOffline, pathname, dispatch]);

    return (
      <EnhancedComponent {...props}>
        {(newProps) => (
          <Component {...newProps} />
        )}
      </EnhancedComponent>
    );
  }
  HOC.propTypes = {
    isOffline: PropTypes.bool.isRequired,
  };
  const mapStateToProps = (state) => ({
    isOffline: selectors.isOffline(state),
  });
  return connect(mapStateToProps)(HOC);
};

export default withEnhancedDocuments;
