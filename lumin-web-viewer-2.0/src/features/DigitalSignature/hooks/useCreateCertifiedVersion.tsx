import { ModalTypes } from 'lumin-ui/kiwi-ui';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import useGetOwnCurrentDoc from 'hooks/useGetOwnCurrentDoc';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import logger from 'helpers/logger';

import modalEvent, { ModalPurpose, ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';

import { bottomToastActions } from 'features/BottomToast/slice';

import { LOGGER } from 'constants/lumin-common';

import { processCreateCertifiedVersion } from '../apis';
import { MAX_FILE_SIZE_MB } from '../constants';
import { digitalSignatureActions } from '../slices';

const useCreateCertifiedVersion = () => {
  const dispatch = useDispatch();

  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { organization: orgOwnCurrentDocument } = useGetOwnCurrentDoc();
  const { t } = useTranslation();

  const createCertifiedVersion = async () => {
    if (currentDocument.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      dispatch(
        actions.openModal({
          message: t('viewer.bananaSign.errorMessageHasReachedSizeLimit', { size: MAX_FILE_SIZE_MB }),
          title: t('viewer.bananaSign.errorHasReachedSizeLimit'),
          confirmButtonTitle: t('common.gotIt'),
          useReskinModal: true,
        })
      );
      return;
    }

    dispatch(bottomToastActions.setMessage(t('viewer.bananaSign.processingCertifiedVersion')));
    dispatch(bottomToastActions.setOpen(true));
    dispatch(digitalSignatureActions.setShouldShowBanner(false));
    dispatch(digitalSignatureActions.setIsProcessing(true));
    try {
      await processCreateCertifiedVersion(currentDocument, orgOwnCurrentDocument);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.CREATE_CERTIFIED_VERSION,
        error: error as Error,
      });
      dispatch(bottomToastActions.setOpen(false));
      dispatch(digitalSignatureActions.setIsProcessing(false));
      dispatch(
        actions.openModal({
          type: ModalTypes.warning,
          message: t('viewer.bananaSign.createCertifiedVersionFailedDescription'),
          title: t('viewer.bananaSign.createCertifiedVersionFailedTitle'),
          confirmButtonTitle: t('common.gotIt'),
          useReskinModal: true,
          onConfirm: () => {
            modalEvent
              .modalConfirmation({
                modalName: ModalName.CREATE_CERTIFIED_VERSION_FAIL,
                modalPurpose: ModalPurpose[ModalName.CREATE_CERTIFIED_VERSION_FAIL],
              })
              .catch(() => {});
          },
        })
      );
      modalEvent
        .modalViewed({
          modalName: ModalName.CREATE_CERTIFIED_VERSION_FAIL,
          modalPurpose: ModalPurpose[ModalName.CREATE_CERTIFIED_VERSION_FAIL],
        })
        .catch(() => {});
    }
  };

  return {
    createCertifiedVersion,
  };
};

export default useCreateCertifiedVersion;
