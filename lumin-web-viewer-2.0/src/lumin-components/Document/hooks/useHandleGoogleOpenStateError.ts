import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'hooks';

import { toastUtils } from 'utils';

import { ModalTypes } from 'constants/lumin-common';
import { UrlSearchParam } from 'constants/UrlSearchParam';

const useHandleGoogleOpenStateError = () => {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  // Show toast when user open drive file with wrong mime type
  useEffect(() => {
    if (searchParams.get(UrlSearchParam.OPEN_GOOGLE_STATE) === 'wrong_mime_type') {
      toastUtils
        .openToastMulti({
          message: t('openDrive.unsupportOpenFile'),
          type: ModalTypes.ERROR,
        })
        .finally(() => {});
      searchParams.delete(UrlSearchParam.OPEN_GOOGLE_STATE);
      setSearchParams(searchParams, { replace: true });
    }
  }, []);
};

export default useHandleGoogleOpenStateError;
