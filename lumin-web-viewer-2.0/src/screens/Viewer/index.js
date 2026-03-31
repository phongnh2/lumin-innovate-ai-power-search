import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import { compose } from 'redux';

import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';
import selectors from 'selectors';

import SkeletonLoading from 'lumin-components/SkeletonLoading';

import { OfflineDocumentIntercept } from 'HOC/OfflineStorageHOC';

import useShowPromptUserInViewer from 'hooks/useShowPromptUserInViewer';
import { useTranslation } from 'hooks/useTranslation';

import { authService } from 'services/authServices';
import { branchService } from 'services/branchServices';

import { isMobileDevice } from 'helpers/device';

import errorExtract from 'utils/error';
import { isUserInNewAuthenTestingScope } from 'utils/newAuthenTesting';

import useAnonymousViewPath from 'features/Document/hooks/useAnonymousViewPath';
import { useGoogleLogin } from 'features/GoogleOneTap/hooks/useGoogleLogin';
import { useGoogleOneTapLogin } from 'features/GoogleOneTap/hooks/useGoogleOneTapLogin';

import { GOOGLE_PICKER_CLIENTID } from 'constants/urls';

import withDocument from './HOC/withDocument';
import withOrganization from './HOC/withOrganization';
import { useCloseViewerNavigation } from './hooks/useCloseViewerNavigation';
import { useGoogleOneTapErrorHandler } from './hooks/useGoogleOneTapErrorHandler';
import { useHandleDefaultTab } from './hooks/useHandleDefaultTab';
import { useHandleErrorUI } from './hooks/useHandleErrorUI';
import { useHandleRecentDocumentList } from './hooks/useHandleRecentDocumentList';
import Viewer from './Viewer';

const PDFViewerProxy = (props) => {
  const {
    currentUser,
    isOffline,
    currentDocument,
    isAuthenticating,
    fetchingDocumentError,
    isLoadingCore,
    ...otherProps
  } = props;
  const isFetchingCurrentDocument = useSelector(selectors.getIsFetchingCurrentDocument);
  const isShowPromptUserInViewer = useShowPromptUserInViewer();

  const location = useLocation();
  const navigate = useNavigate();
  const { documentId: documentIdParam } = useParams();
  const { t } = useTranslation();
  const { renderErrorUI } = useHandleErrorUI({ error: fetchingDocumentError });
  const { isFillAndSignDefaultTab } = useHandleDefaultTab();
  const dispatch = useDispatch();

  useHandleRecentDocumentList({
    error: fetchingDocumentError,
  });

  useEffect(() => {
    if (isFillAndSignDefaultTab) {
      dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.FILL_AND_SIGN.value));
    }
  }, [isFillAndSignDefaultTab]);

  useEffect(() => {
    const closeJourney = () => {
      branchService.closeJourney();
      branchService.logout();
    };

    let hasShowBanner = false;
    let hasLeaveViewer = false;
    const setHasShowBanner = () => {
      hasShowBanner = true;
      if (hasLeaveViewer) {
        setTimeout(closeJourney, 0);
      }
      branchService.removeEventListener(setHasShowBanner);
    };
    if (isMobileDevice) {
      branchService.init(documentIdParam, t);
      branchService.addEventListener('didShowJourney', setHasShowBanner);
    }
    return () => {
      if (isMobileDevice) {
        hasLeaveViewer = true;
        if (hasShowBanner) {
          closeJourney();
        }
      }
    };
  }, [documentIdParam]);

  useEffect(() => {
    if (currentUser?._id) {
      const isSatisfiedUser = isUserInNewAuthenTestingScope(currentUser);

      if (isSatisfiedUser) {
        const { url } = authService.getNewAuthenRedirectUrl(currentUser);
        navigate(url);
      }
    }
  }, [currentUser?._id]);

  const fromNewAuthFlow = Boolean(location.state?.fromNewAuthFlow);
  const documents = React.useMemo(() => {
    if (!currentDocument) {
      return [];
    }
    return [currentDocument];
  }, [currentDocument]);

  useCloseViewerNavigation();

  const [loginGoogle] = useGoogleLogin();
  const { handleError: handleGoogleOneTapError } = useGoogleOneTapErrorHandler();
  const isGoogleGuestMode = useAnonymousViewPath();

  const isGoogleOneTapDisabled =
    !!currentUser || !currentDocument || isLoadingCore || isAuthenticating || Boolean(isGoogleGuestMode);

  useGoogleOneTapLogin({
    onError: handleGoogleOneTapError,
    onSuccess: loginGoogle,
    googleAccountConfigs: {
      client_id: GOOGLE_PICKER_CLIENTID,
    },
    disabled: isGoogleOneTapDisabled,
  });

  if (fetchingDocumentError) {
    return renderErrorUI();
  }

  return (!fetchingDocumentError && !currentDocument) ||
    isFetchingCurrentDocument ||
    isAuthenticating ||
    isLoadingCore ? (
    <SkeletonLoading />
  ) : (
    <OfflineDocumentIntercept documents={documents}>
      {({ documents: interceptedDocuments }) =>
        interceptedDocuments[0] || !!fetchingDocumentError ? (
          <Viewer
            location={location}
            currentUser={currentUser}
            isOffline={isOffline}
            match={{ params: { documentId: documentIdParam } }}
            navigate={navigate}
            currentDocument={interceptedDocuments[0]}
            isShowPromptUserInViewer={isShowPromptUserInViewer}
            fromNewAuthFlow={fromNewAuthFlow}
            error={fetchingDocumentError ? errorExtract.extractGqlError(fetchingDocumentError) : null}
            {...otherProps}
          />
        ) : null
      }
    </OfflineDocumentIntercept>
  );
};

PDFViewerProxy.propTypes = {
  currentUser: PropTypes.object,
  isOffline: PropTypes.bool,
  currentDocument: PropTypes.object,
  isAuthenticating: PropTypes.bool.isRequired,
  fetchingDocumentError: PropTypes.object,
  isLoadingCore: PropTypes.bool.isRequired,
};

PDFViewerProxy.defaultProps = {
  currentUser: null,
  isOffline: true,
  currentDocument: null,
  fetchingDocumentError: null,
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
  isOffline: selectors.isOffline(state),
  hasAppliedRedaction: selectors.hasAppliedRedaction(state),
  isAuthenticating: selectors.isAuthenticating(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeModal: () => dispatch(actions.closeModal()),
  setDeactiveHeaderItem: (toolName) => dispatch(actions.setDeactiveHeaderItem(toolName)),
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withOrganization, withDocument)(PDFViewerProxy);
