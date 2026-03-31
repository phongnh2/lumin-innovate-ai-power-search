import { Icomoon, IconSize, MenuItem, PlainTooltip, Skeleton } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { AvailabilityToolCheckProvider } from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { documentSyncSelectors } from 'features/Document/slices';
import { useFormFieldDetectionUsage } from 'features/FormFieldDetection/hooks/useFormFieldDetectionUsage';

import { TOOLS_NAME } from 'constants/toolsName';

import { FormBuilderItemProps, IToolPopperRenderParams } from './interfaces';

import styles from './FormBuilderTool.module.scss';

const FormBuilderFormFieldDetectionItem = (props: FormBuilderItemProps) => {
  const { t } = useTranslation();
  const { onCleanUp, onClick } = props;
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const { isOverFFDQuota, isLoadingFFDUsage, overFFDQuotaMessage } = useFormFieldDetectionUsage();
  const isDocumentSyncing = useSelector(documentSyncSelectors.isSyncing);
  const renderItemSkeleton = () => (
    <>
      <Skeleton visible radius="sm" width="80%" mb={4} height={12} />
      <Skeleton visible radius="sm" width="30%" height={12} />
    </>
  );

  const getTooltipContent = () => {
    if (isOverFFDQuota) {
      return overFFDQuotaMessage;
    }

    if (isDocumentSyncing) {
      return t('viewer.waitingForDocumentEdit');
    }

    return null;
  };

  return (
    <AvailabilityToolCheckProvider
      toolName={TOOLS_NAME.FORM_FIELD_DETECTION}
      popperPlacement="right-start"
      popperContainerWidth={304}
      useModal
      onClose={onCleanUp}
      render={(renderParams: IToolPopperRenderParams) => (
        <PlainTooltip content={getTooltipContent()} position="bottom" maw={270}>
          <MenuItem
            onClick={() => onClick(renderParams)}
            data-cy="ai_auto_detect"
            leftSection={
              isLoadingFFDUsage ? (
                <Skeleton radius="sm" width={24} height={24} />
              ) : (
                <Icomoon size={IconSize.lg} type="sparkles-lg" />
              )
            }
            activated={renderParams.isOpen}
            data-lumin-btn-name={ButtonName.FORM_FIELD_DETECTION}
            disabled={!currentUser || isOverFFDQuota || isDocumentSyncing}
            style={{ pointerEvents: isLoadingFFDUsage ? 'none' : 'auto' }}
          >
            {isLoadingFFDUsage ? (
              renderItemSkeleton()
            ) : (
              <div className={styles.menuItemContainer}>
                {t('viewer.formFieldDetection.toolMenu.aiAutoDetect')}
                <div className={styles.betaTag}>BETA</div>
              </div>
            )}
          </MenuItem>
        </PlainTooltip>
      )}
    />
  );
};

export default FormBuilderFormFieldDetectionItem;
