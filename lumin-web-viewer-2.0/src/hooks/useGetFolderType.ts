import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import selectors from 'selectors';

import useGetCurrentOrganization from 'hooks/useGetCurrentOrganization';

import { isSystemFileSupported } from 'helpers/pwa';

import { useHandleManipulateDateGuestMode } from 'features/GuestModeManipulateCache/useHandleManipuldateGuestMode';

import { DOMAIN_WHITE_LIST } from 'constants/customConstant';
import { folderType } from 'constants/documentConstants';

import useHomeMatch from './useHomeMatch';
import useShallowSelector from './useShallowSelector';
import { useViewerMatch } from './useViewerMatch';

interface TypeMapping {
  personal: string;
  workspace: string;
  shared: string;
  starred: string;
  space: string;
  ['on-my-device']?: string;
  [key: string]: string; // Index signature to allow additional properties
}

const useGetFolderType = () => {
  const { type } = useParams();
  const documentTabType = useSelector(selectors.getDocumentTabType);
  const currentOrganization = useGetCurrentOrganization();
  const { isViewer } = useViewerMatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { documentType } = currentDocument || {};
  const { isRecentTab, isTrendingTab } = useHomeMatch();
  const { isManipulateInGuestMode } = useHandleManipulateDateGuestMode();

  const { folderType: folderTypeFromTeamSelector } = useSelector(selectors.getTeamSelectorData);

  const typeMapping: TypeMapping = {
    personal: folderType.INDIVIDUAL,
    workspace: folderType.ORGANIZATION,
    shared: folderType.SHARED,
    starred: folderType.STARRED,
    space: folderType.TEAMS,
  };
  if (isSystemFileSupported() && DOMAIN_WHITE_LIST.ON_MY_DEVICE_TAB.includes(currentOrganization?.domain)) {
    typeMapping['on-my-device'] = folderType.DEVICE;
  }

  if (isRecentTab || isManipulateInGuestMode) {
    return folderType.INDIVIDUAL;
  }
  if (isTrendingTab) {
    return folderTypeFromTeamSelector;
  }

  const _type = type || documentTabType;
  return isViewer ? documentType?.toLowerCase() : typeMapping[_type?.toLowerCase()] || folderType.INDIVIDUAL;
};

useGetFolderType.propTypes = {};

export default useGetFolderType;
