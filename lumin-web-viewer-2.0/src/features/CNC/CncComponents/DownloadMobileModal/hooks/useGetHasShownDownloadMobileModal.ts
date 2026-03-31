import { useLocalStorage } from 'react-use';

import { LocalStorageKey } from 'constants/localStorageKey';

const useGetHasShownDownloadMobileModal = () => {
  const [storage, setStorage] = useLocalStorage<boolean>(LocalStorageKey.HAS_SHOWN_DOWNLOAD_MOBILE_APP, false);

  const setOrgHasShownDownloadMobileModal = () => {
    setStorage(true);
  };

  return {
    hasShownDownloadMobileModal: storage,
    setOrgHasShownDownloadMobileModal,
  };
};

export default useGetHasShownDownloadMobileModal;
