import classNames from 'classnames';
import { DialogSize, Modal, Button } from 'lumin-ui/kiwi-ui';
import React, { Fragment, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import loadingIconDark from 'assets/images/hour-glass-loading-dark.png';
import loadingIcon from 'assets/images/hour-glass-loading.png';

import selectors from 'selectors';
import { RootState } from 'store';

import CircularProgress from 'lumin-components/GeneralLayout/general-components/CircularProgress';

import useProgress from 'hooks/useProgress';
import { useThemeMode } from 'hooks/useThemeMode';

import { DataElements } from 'constants/dataElement';

import styles from './ViewerProgressModal.module.scss';

type ViewerProgressModalProps = {
  isOpen: boolean;
  viewerLoadingModalData: {
    totalSteps: number;
    currentStep: number;
    renderStatus: (totalSteps: number, currentStep: number) => string;
    onCancel?: () => void;
    size?: DialogSize;
    circularSize?: number;
    progressSuffix?: string;
    isShowPercentage?: boolean;
    variant?: string;
    isHideProgressContent?: boolean;
    isCancelable?: boolean;
    fancyLoading?: boolean;
    shouldDisableCancelAtSecondToLastStep?: boolean;
  };
};

export const ViewerProgressModal = ({
  isOpen,
  viewerLoadingModalData: {
    totalSteps,
    currentStep,
    renderStatus,
    onCancel,
    size = DialogSize.sm,
    circularSize = 84,
    progressSuffix = '',
    isShowPercentage = false,
    variant,
    isHideProgressContent,
    isCancelable = true,
    fancyLoading = false,
    shouldDisableCancelAtSecondToLastStep = true,
  },
}: ViewerProgressModalProps) => {
  const themeMode = useThemeMode();
  const { t } = useTranslation();
  const { progress, start, end, reset } = useProgress({ speedFactor: 0.2 });

  const currentProgress = isShowPercentage ? Math.round(progress) : currentStep;

  const getProgressContent = () => {
    if (isHideProgressContent) {
      return null;
    }

    if (isShowPercentage) {
      return `${currentProgress}%`;
    }

    return progressSuffix ? (
      <>
        <p>{`${currentProgress}/${totalSteps}`}</p>
        <p>{progressSuffix}</p>
      </>
    ) : (
      `${currentProgress}/${totalSteps}`
    );
  };

  useEffect(() => {
    if (isShowPercentage) {
      start();
    } else {
      end();
      reset();
    }
  }, [isShowPercentage]);

  const imageSrc = {
    light: loadingIcon,
    dark: loadingIconDark,
  }[themeMode];

  const InnerWrapper = useMemo(() => {
    if (fancyLoading) {
      return 'div';
    }
    return Fragment;
  }, [fancyLoading]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      className={fancyLoading && styles.modal}
      opened
      size={size}
      onClose={onCancel}
      closeOnClickOutside={false}
      closeOnEscape={false}
      classNames={{
        body: classNames(fancyLoading && styles.bodyFancyMode),
        content: classNames(fancyLoading && styles.dialogContentFancyMode),
      }}
    >
      <InnerWrapper>
        {fancyLoading && <div className={styles.boxGlow} />}
        <div className={styles.wrapper} data-fancy-mode={fancyLoading} data-cy="viewer_progress_modal">
          {fancyLoading ? (
            <img style={{ width: 100 }} src={imageSrc} alt="loading" />
          ) : (
            <div className={styles.progressWrapper} data-variant={variant}>
              <CircularProgress
                value={(currentProgress * 100) / totalSteps}
                content={getProgressContent()}
                variant="determinate"
                size={circularSize}
                thickness={2}
              />
            </div>
          )}

          <p className={styles.status} data-variant={variant}>
            {renderStatus(totalSteps, currentProgress)}
          </p>
          {onCancel && (
            <Button
              variant="text"
              disabled={!isCancelable || (shouldDisableCancelAtSecondToLastStep && currentProgress === totalSteps - 1)}
              onClick={onCancel}
            >
              {t('action.cancel')}
            </Button>
          )}
        </div>
      </InnerWrapper>
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => ({
  isOpen: selectors.isElementOpen(state, DataElements.VIEWER_LOADING_MODAL),
  viewerLoadingModalData: selectors.viewerLoadingModalData(state),
});

export default connect(mapStateToProps)(ViewerProgressModal);
