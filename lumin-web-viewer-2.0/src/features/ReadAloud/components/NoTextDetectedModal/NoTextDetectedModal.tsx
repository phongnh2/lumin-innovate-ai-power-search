import { Modal } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import NotDetectedImgDark from 'assets/images/new-layout/not-detected-dark.png';
import NotDetectedImg from 'assets/images/new-layout/not-detected.png';

import selectors from 'selectors';

import { useIsSystemFile } from 'hooks/useIsSystemFile';
import useShallowSelector from 'hooks/useShallowSelector';
import { useThemeMode } from 'hooks/useThemeMode';

import { getToolChecker } from 'helpers/getToolPopper';

import useApplyOcrTool from 'features/DocumentOCR/useApplyOcrTool';
import { isValidToApplyOCR } from 'features/DocumentOCR/utils';
import { readAloudActions, readAloudSelectors } from 'features/ReadAloud/slices';

import { LANDING_PAGE_ROUTE } from 'constants/Routers';
import { TOOLS_NAME } from 'constants/toolsName';

import styles from './NoTextDetectedModal.module.scss';

const NoTextDetectedModal = () => {
  const theme = useThemeMode();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isOpen = useSelector(readAloudSelectors.isNoTextModalOpen);
  const { isSystemFile } = useIsSystemFile();
  const applyOCR = useApplyOcrTool();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  const { isToolAvailable } = getToolChecker({
    toolName: TOOLS_NAME.OCR,
    currentUser,
    currentDocument,
    translator: t,
  });

  const notDetectedImage = useMemo(
    () =>
      ({
        light: NotDetectedImg,
        dark: NotDetectedImgDark,
      }[theme]),
    [theme]
  );

  const handleConfirm = async () => {
    dispatch(readAloudActions.setIsNoTextModalOpen(false));
    await applyOCR();
  };

  const handleCloseModal = () => {
    dispatch(readAloudActions.setIsNoTextModalOpen(false));
  };

  const checkIsValidToPerformOCR = () =>
    isDocumentLoaded && isValidToApplyOCR(currentDocument) && isToolAvailable && !isSystemFile;

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      title={t('viewer.readAloud.noTextDetectedModal.title')}
      opened={isOpen}
      onClose={handleCloseModal}
      centered
      titleCentered
      Image={<img className={styles.image} src={notDetectedImage} alt="no text detected" />}
      cancelButtonProps={{
        title: t('action.close'),
        variant: 'text',
      }}
      onCancel={handleCloseModal}
      confirmButtonProps={{
        title: t('viewer.readAloud.noTextDetectedModal.confirmButton'),
        variant: 'tonal',
      }}
      message={
        <Trans
          i18nKey="viewer.readAloud.noTextDetectedModal.message"
          components={{
            a: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
              <a className={styles.link} href={LANDING_PAGE_ROUTE.OCR_BLOG} target="_blank" rel="noreferrer" />
            ),
          }}
        />
      }
      {...(checkIsValidToPerformOCR() && { onConfirm: handleConfirm })}
    />
  );
};

export default NoTextDetectedModal;
