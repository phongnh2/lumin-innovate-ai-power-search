import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import actions from 'actions';

import { useTranslation } from 'hooks/useTranslation';

import { ErrorCode } from 'constants/errorCode';
import { UrlSearchParam } from 'constants/UrlSearchParam';

export const useRestrictedUploadDocumentModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const errorCode = searchParams.get(UrlSearchParam.ERROR_CODE);
    const storage = searchParams.get(UrlSearchParam.STORAGE);

    const cleanSearchParams = () => {
      searchParams.delete(UrlSearchParam.ERROR_CODE);
      searchParams.delete(UrlSearchParam.STORAGE);
      setSearchParams(searchParams);
    };

    if (errorCode === ErrorCode.Document.DOMAIN_RESTRICTED_FROM_UPLOADING_DOCUMENT) {
      cleanSearchParams();
      dispatch(
        actions.openModal({
          title: t('restrictedUploadDocumentModal.title'),
          message: t('restrictedUploadDocumentModal.message', { storage }),
          confirmButtonTitle: t('common.gotIt'),
          useReskinModal: true,
          disableBackdropClick: true,
          disableEscapeKeyDown: true,
          onConfirm: () => {
            dispatch(actions.closeModal());
          },
        })
      );
    }
  }, []);
};
