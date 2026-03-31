import React, { useCallback, useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import DocumentListInfo from 'lumin-components/DocumentComponents/components/DocumentListInfo';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useGetCurrentTeam, useGetFolderType, useTranslation } from 'hooks';

import { commonUtils } from 'utils';

import { folderType } from 'constants/documentConstants';

import * as Styled from '../Document.styled';

const DISABLED_TOOLTIP = [folderType.STARRED, folderType.SHARED, folderType.INDIVIDUAL, folderType.DEVICE];

const DocumentTitle = () => {
  const { t } = useTranslation();
  const { name: orgName } = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const currentFolderType = useGetFolderType();
  const { name: teamName } = useGetCurrentTeam() || {};
  const getFolderDocumentText = useCallback(() => ({
    [folderType.DEVICE]: commonUtils.formatTitleCaseByLocale(t('pageTitle.deviceDocuments')),
    [folderType.INDIVIDUAL]: t('pageTitle.myDocuments'),
    [folderType.TEAMS]: teamName,
    [folderType.ORGANIZATION]: orgName,
    [folderType.STARRED]: t('pageTitle.starredDocuments'),
    [folderType.SHARED]: t('sidebar.sharedWithMe'),
  }[currentFolderType]), [currentFolderType, orgName, teamName]);

  return useMemo(() => (
    <Styled.TitleWrapper className='joyride-documents'>
      <Styled.Title>
        <Tooltip title={DISABLED_TOOLTIP.includes(currentFolderType) ? '' : getFolderDocumentText()}>
          <span>
            {getFolderDocumentText()}
          </span>
        </Tooltip>
      </Styled.Title>
      <DocumentListInfo currentFolderType={currentFolderType} />
    </Styled.TitleWrapper>
  ), [currentFolderType, getFolderDocumentText]);
};

DocumentTitle.propTypes = {

};

export default DocumentTitle;
