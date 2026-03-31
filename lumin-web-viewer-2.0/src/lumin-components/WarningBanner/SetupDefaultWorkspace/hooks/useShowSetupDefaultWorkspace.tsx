import { get, uniq } from 'lodash';
import { useLocalStorage } from 'react-use';

import { WarningBannersController } from 'luminComponents/WarningBanner/hooks/useWarningBannerController';

import { useGetCurrentUser } from 'hooks';
import useAgreementListModuleMatch from 'hooks/useAgreementListModuleMatch';

import { WarningBannerType } from 'constants/banner';
import { LocalStorageKey } from 'constants/localStorageKey';

type Params = {
  controller: WarningBannersController;
};

const useShowSetupDefaultWorkspace = ({ controller }: Params) => {
  const [storage, setStorage] = useLocalStorage<string[]>(LocalStorageKey.HAS_CLOSED_SETUP_DEFAULT_WORKSPACE_IN_AG, []);

  const currentUser = useGetCurrentUser();
  const { isInAgreementListModulePage } = useAgreementListModuleMatch();

  const defaultWorkspace = get(currentUser, 'setting.defaultWorkspace');
  const isClosedSetupDefaultWorkspaceInAg = storage.includes(currentUser?._id);
  const showSetupDefaultWorkspace =
    isInAgreementListModulePage && !isClosedSetupDefaultWorkspaceInAg && !defaultWorkspace;

  const handleCloseSetupDefaultWorkspace = () => {
    const newStorage = uniq([...storage, currentUser?._id]);
    setStorage(newStorage);
    controller.setBannerClosed(WarningBannerType.SETUP_DEFAULT_WORKSPACE.value);
  };

  return {
    showSetupDefaultWorkspace,
    handleCloseSetupDefaultWorkspace,
  };
};

export default useShowSetupDefaultWorkspace;
