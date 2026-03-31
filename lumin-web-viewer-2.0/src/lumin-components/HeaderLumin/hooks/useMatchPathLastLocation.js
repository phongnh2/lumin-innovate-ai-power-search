import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { matchPaths } from 'helpers/matchPaths';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { DocumentFolderTypeTab } from 'constants/documentFolderTypeTab';
import { LocationType } from 'constants/locationConstant';
import { ROUTE_MATCH } from 'constants/Routers';

const useMatchPathLastLocation = (lastLocation) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isOffline = useSelector(selectors.isOffline);
  const { params } = matchPaths([ROUTE_MATCH.DOCUMENTS, `${ROUTE_MATCH.ORG_DOCUMENT}/:type`], lastLocation) || {};
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { isTemplateViewer } = useTemplateViewerMatch();

  const isMatchedFolderPath = matchPaths(
    [...Object.values(ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT), ROUTE_MATCH.FOLDER_DOCUMENT],
    lastLocation
  );
  const isMatchedTeamDocument = matchPaths(
    [ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT.TEAM, ROUTE_MATCH.TEAM_DOCUMENT],
    lastLocation
  );

  const isMatchedHomePage = matchPaths([ROUTE_MATCH.RECENT_DOCUMENTS, ROUTE_MATCH.TRENDING_DOCUMENTS], lastLocation);

  const { type } = params || {};
  const textPersonal = t('pageTitle.myDocuments');
  const textMyTemplates = t('pageTitle.myTemplates');

  const getTemplateLocationText = () => {
    const templateType = currentDocument?.belongsTo?.type;
    switch (templateType) {
      case LocationType.PERSONAL:
        return textMyTemplates;
      case LocationType.ORGANIZATION:
        return t('pageTitle.orgTemplates');
      case LocationType.ORGANIZATION_TEAM:
        return t('pageTitle.teamTemplates');
      default:
        return textMyTemplates;
    }
  };

  const getFolderName = () => currentDocument?.folderData?.name || textPersonal;

  useEffect(() => {
    navigate(location, {
      state: {
        ...location.state,
        type: null,
      },
      replace: true,
    });
  }, []);

  if (isOffline) {
    return 'Offline';
  }

  if (isTemplateViewer) {
    return getTemplateLocationText();
  }

  if (!lastLocation) {
    return textPersonal;
  }

  if (isMatchedHomePage) {
    return t('common.homePage');
  }

  if (isMatchedFolderPath) {
    return getFolderName();
  }

  if (isMatchedTeamDocument) {
    return t('pageTitle.teamDocuments');
  }

  return (
    {
      [DocumentFolderTypeTab.PERSONAL]: textPersonal,
      [DocumentFolderTypeTab.SHARED]: t('pageTitle.sharedDocuments'),
      [DocumentFolderTypeTab.TEAM]: t('pageTitle.teamDocuments'),
      [DocumentFolderTypeTab.DEVICE]: t('pageTitle.deviceDocuments'),
      [DocumentFolderTypeTab.ORGANIZATION]: t('common.circle'),
      [DocumentFolderTypeTab.STARRED]: t('pageTitle.starredDocuments'),
    }[type] || textPersonal
  );
};

export default useMatchPathLastLocation;
