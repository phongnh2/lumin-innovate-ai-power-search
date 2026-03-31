import { useLocalStorage } from 'react-use';

import { LocalStorageKey } from 'constants/localStorageKey';

const useGetHasShownDownloadDesktopModal = () => {
  const [storage, setStorage] = useLocalStorage<boolean>(LocalStorageKey.HAS_SHOWN_DOWNLOAD_DESKTOP_APP, false);

  const setOrgHasShownDownloadDesktopModal = () => {
    setStorage(true);
  };

  return {
    hasOrgShownDownloadDesktopModal: storage,
    setOrgHasShownDownloadDesktopModal,
  };
};

export default useGetHasShownDownloadDesktopModal;
