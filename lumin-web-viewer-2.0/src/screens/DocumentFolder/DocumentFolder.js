import PropTypes from 'prop-types';
import React, { useEffect, useContext, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { matchPath, Navigate, useNavigate, useLocation, useParams } from 'react-router';
import { compose } from 'redux';

import { DndProvider } from '@libs/react-dnd';

import selectors from 'selectors';

import BackToTop from 'lumin-components/BackToTop';
import { DocumentSearchContext } from 'lumin-components/Document/context';
import withEnhancedDocuments from 'lumin-components/Document/HOC/withEnhancedDocuments';
import DocumentComponents from 'lumin-components/DocumentComponents';
import Breadcrumbs from 'lumin-components/Shared/Breadcrumb';
import { NoPermission } from 'lumin-components/UnauthorizedContainer';
import {
  useCreateFolderSubscription,
  useGetAllFolder,
  useUpdateFolderListSubscription,
} from 'luminComponents/Document/hooks';

import withDropDocPopup from 'HOC/withDropDocPopup';
import withRedirectOrganizationDocument from 'HOC/withRedirectOrganizationDocument';
import withRedirectTeamDocument from 'HOC/withRedirectTeamDocument';

import { useDropboxMessageEvent, useSetupCoreWorker, useTranslation, useSyncDocumentTabType } from 'hooks';

import { errorUtils } from 'utils';

import { folderType, MOBILE_BACK_TO_TOP_TRIGGER_AT } from 'constants/documentConstants';
import { DefaultErrorCode, ErrorCode } from 'constants/errorCode';
import { DocFolderMapping, FOLDER_SORT_DIRECTION, FOLDER_SORT_OPTIONS, FolderType } from 'constants/folderConstant';
import { ORG_PATH } from 'constants/organizationConstants';
import { ROUTE_MATCH, Routers } from 'constants/Routers';

import MainBody from './components/MainBody';
import PageTitle from './components/PageTitle';
import { useGetParentUrl } from './hooks';
import withFetchingFolder from './withFetchingFolder';

import * as Styled from './DocumentFolder.styled';

const DocumentFolder = ({
  searchKey,
  setSearchKey,
  isFocusing,
  setFocusing,
  folderLoading,
  error,
  currentFolderType,
  folderDocumentProps,
  folder,
  folderListData,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useSyncDocumentTabType();

  const { setFolder } = useContext(withDropDocPopup.DropDocumentPopupContext);

  const { folderId } = useParams();
  const { total: documentTotal, loading: documentLoading, prevSearchKey, documentList, refetch } = folderDocumentProps;
  const { data: folderList, loading: folderListLoading } = folderListData;
  const isInOrgPage = Boolean(matchPath({ path: ORG_PATH, end: false }, location.pathname));
  const isInDocumentPage = Boolean(matchPath({ path: ROUTE_MATCH.DOCUMENTS, end: false }, location.pathname));
  const parentUrl = useGetParentUrl({ folder });
  const shouldShowResultText = Boolean(prevSearchKey && searchKey && !documentLoading && !folderListLoading);
  const [openDefaultSearchView, setOpenDefaultSearchView] = useState(false);

  const total = documentTotal + folderList.length;
  const isEmptySearchResult = shouldShowResultText && !total;
  const folderTitleMapping = {
    [folderType.INDIVIDUAL]: t('pageTitle.myDocuments'),
    [folderType.TEAMS]: t('pageTitle.teamDocuments'),
    [folderType.ORGANIZATION]: t('pageTitle.orgDocuments'),
    [folderType.STARRED]: t('pageTitle.starredDocuments'),
    [folderType.SHARED]: t('sidebar.sharedWithMe'),
  };

  const defaultFolderType = isInOrgPage ? FolderType.ORGANIZATION : FolderType.PERSONAL;
  const documentFolderType =
    currentFolderType === folderType.STARRED ? defaultFolderType : DocFolderMapping[currentFolderType];

  const { update, sortOption, value } = useGetAllFolder({
    type: documentFolderType,
    sortKey: FOLDER_SORT_OPTIONS.DATE_CREATED.key,
    sortDirection: FOLDER_SORT_DIRECTION.DESC,
    parentId: folderId,
    searchKey,
  });
  const folderSubscriptionProps = {
    setFolderList: update,
    sortOption,
    folders: value,
    isSearchView: isFocusing || Boolean(searchKey),
  };
  useCreateFolderSubscription(folderSubscriptionProps);
  useUpdateFolderListSubscription(folderSubscriptionProps);

  const searchContext = useMemo(
    () => ({
      isFocusing,
      setFocusing,
      searchKey,
      isSearchView: isFocusing || Boolean(searchKey),
      documentLoading,
      folderLoading,
      folderListLoading,
      isEmptyList: !documentList.length,
      totalFoundResults: total,
    }),
    [documentList.length, documentLoading, folderLoading, isFocusing, searchKey, setFocusing, total, folderListLoading]
  );

  const getFolderTitle = () => {
    if (!folder) {
      return null;
    }
    const breadcrumbData = [
      {
        title: folderTitleMapping[currentFolderType],
        url: parentUrl,
        disabled: !parentUrl,
      },
      {
        title: folder.name,
      },
    ];

    return (
      <Styled.StyledTitleWrapper>
        <Styled.StyledMainTitle>{folder.name}</Styled.StyledMainTitle>
        <Breadcrumbs data={breadcrumbData} />
      </Styled.StyledTitleWrapper>
    );
  };

  const onBackWhenError = () => {
    navigate(Routers.ROOT, { replace: true });
  };

  useSetupCoreWorker();
  useDropboxMessageEvent();

  useEffect(() => {
    if (folder) {
      setFolder(folder);
    }
  }, [folder, setFolder]);

  useEffect(() => {
    setOpenDefaultSearchView(isFocusing && !searchKey);
  }, [searchKey, isFocusing]);

  const { code } = errorUtils.extractGqlError(error);

  if ([DefaultErrorCode.FORBIDDEN, ErrorCode.Common.NOT_FOUND].includes(code)) {
    return (
      <NoPermission
        disabledLayout
        title={t('noPermissionOrganization.title')}
        backButtonLabel={t('noPermissionOrganization.backBtn')}
        onBack={onBackWhenError}
      />
    );
  }

  if (error) {
    return <Navigate to={Routers.ROOT} />;
  }

  return (
    <>
      <PageTitle folderName={folder?.name} />
      <DndProvider>
        <DocumentSearchContext.Provider value={searchContext}>
          <Styled.StyledContainerReskin $isInOrgPage={isInOrgPage || isInDocumentPage}>
            {!folderLoading && (
              <DocumentComponents.HeaderTitle
                setSearchKey={setSearchKey}
                leftTitle={getFolderTitle()}
                canUpload
                folder={folder}
              />
            )}
            {error ? (
              <p>
                <Trans
                  i18nKey="documentPage.getDocumentFailed"
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label
                  components={{ Link: <span className="link" onClick={refetch} role="button" tabIndex={0} /> }}
                />
              </p>
            ) : (
              <MainBody
                openDefaultSearchView={openDefaultSearchView}
                isEmptySearchResult={isEmptySearchResult}
                folder={folder}
                folderDocumentsData={folderDocumentProps}
                folderList={folderList}
                searchKey={searchKey}
                documentLoading={documentLoading}
                folderLoading={folderListLoading}
              />
            )}
          </Styled.StyledContainerReskin>
        </DocumentSearchContext.Provider>
        <BackToTop stickAt={MOBILE_BACK_TO_TOP_TRIGGER_AT} />
      </DndProvider>
    </>
  );
};

DocumentFolder.propTypes = {
  searchKey: PropTypes.string.isRequired,
  setSearchKey: PropTypes.func.isRequired,
  isFocusing: PropTypes.bool.isRequired,
  setFocusing: PropTypes.func.isRequired,
  folderLoading: PropTypes.bool.isRequired,
  currentFolderType: PropTypes.string.isRequired,
  folderDocumentProps: PropTypes.object.isRequired,
  error: PropTypes.object,
  folder: PropTypes.object,
  folderListData: PropTypes.object.isRequired,
};

DocumentFolder.defaultProps = {
  error: null,
  folder: null,
};

const mapStateToProps = (state) => ({
  folderListData: selectors.getFolderList(state),
});

export default compose(
  withDropDocPopup.Provider,
  withRedirectOrganizationDocument,
  withRedirectTeamDocument,
  withFetchingFolder,
  withEnhancedDocuments,
  connect(mapStateToProps),
  React.memo
)(DocumentFolder);
