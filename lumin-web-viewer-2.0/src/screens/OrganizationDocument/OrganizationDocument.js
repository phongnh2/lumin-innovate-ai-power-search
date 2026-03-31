import loadable from '@loadable/component';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import { Navigate } from 'react-router-dom';
import { compose } from 'redux';

import selectors from 'selectors';

import Document from 'lumin-components/Document';

import withDropDocPopup from 'HOC/withDropDocPopup';
import withOrganizationTitle from 'HOC/withOrganizationTitle';
import withRedirectOrganizationDocument from 'HOC/withRedirectOrganizationDocument';
import withRedirectTeamDocument from 'HOC/withRedirectTeamDocument';
import UpdateTeamSubscriber from 'src/HOC/UpdateTeamSubscriber';

import {
  useSetupCoreWorker,
  useDropboxMessageEvent,
  useGetCurrentTeam,
  useDesktopMatch,
  useSyncDocumentTabType,
} from 'hooks';
import useShowInformDocument from 'hooks/useShowInformDocument';

import { matchPaths } from 'helpers/matchPaths';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import ModalManager from 'features/CNC/CncComponents/ModalManager';

import { DocumentFolderTypeTab } from 'constants/documentFolderTypeTab';
import { Routers } from 'constants/Routers';
import { TEAM_DOCUMENT_PATHS } from 'constants/teamConstant';

const MigratedInformGuide = lazyWithRetry(() => import('lumin-components/MigratedInformGuide'));

const NoPermissionTeamComponent = loadable(() => import('lumin-components/NoPermissionTeam'));

function OrganizationDocument(props) {
  const isDesktop = useDesktopMatch();
  const location = useLocation();
  const { currentOrganization } = props;
  const currentTeam = useGetCurrentTeam();
  const matchTeamDocumentPath = matchPaths(
    TEAM_DOCUMENT_PATHS.map((route) => ({ path: route, end: false })),
    location.pathname
  );
  const { loading, data: organization } = currentOrganization;
  const { type } = useParams();

  const shouldShowMigratedInform = useShowInformDocument();
  useSetupCoreWorker();

  useDropboxMessageEvent();

  useSyncDocumentTabType();

  if (loading) {
    return null;
  }

  if (type === DocumentFolderTypeTab.DEVICE) {
    return <Navigate to={Routers.ROOT} />;
  }

  const typeIsValid = Object.values(DocumentFolderTypeTab).includes(type);
  if (!typeIsValid) {
    return <Navigate to="/not-found" replace />;
  }

  if (matchTeamDocumentPath && isEmpty(currentTeam)) {
    return <NoPermissionTeamComponent />;
  }
  return (
    <>
      <UpdateTeamSubscriber currentTeam={currentTeam}>
        <Document isInOrgPage />
      </UpdateTeamSubscriber>
      {shouldShowMigratedInform && !isDesktop && <MigratedInformGuide />}
      <ModalManager organization={organization} />
    </>
  );
}

OrganizationDocument.propTypes = {
  currentOrganization: PropTypes.object,
};

OrganizationDocument.defaultProps = {
  currentOrganization: {},
};

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
});

export default compose(
  withDropDocPopup.Provider,
  withOrganizationTitle('common.documents'),
  withRedirectOrganizationDocument,
  withRedirectTeamDocument,
  connect(mapStateToProps),
  React.memo
)(OrganizationDocument);
