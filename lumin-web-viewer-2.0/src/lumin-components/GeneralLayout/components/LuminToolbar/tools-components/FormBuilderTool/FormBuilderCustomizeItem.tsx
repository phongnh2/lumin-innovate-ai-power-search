import { Icomoon, IconSize, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import withValidUserCheck, { AvailabilityToolCheckProvider } from '@new-ui/HOCs/withValidUserCheck';

import SvgElement from 'luminComponents/SvgElement';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { documentSyncSelectors } from 'features/Document/slices';

import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

import { FormBuilderItemProps, IToolPopperRenderParams } from './interfaces';

import styles from './FormBuilderTool.module.scss';

interface FormBuilderCustomizeItemProps extends FormBuilderItemProps {
  isToolAvailable: boolean;
  shouldShowPremiumIcon: boolean;
  toggleCheckPopper: () => void;
  toolName: string;
}

const FormBuilderCustomizeItem = (props: FormBuilderCustomizeItemProps) => {
  const { t } = useTranslation();
  const { onCleanUp, onClick, isInToolbarPopover, isToolAvailable, shouldShowPremiumIcon, toggleCheckPopper } = props;
  const isSyncing = useSelector(documentSyncSelectors.isSyncing);

  const renderMenuItem = (renderParams: IToolPopperRenderParams) => (
    <PlainTooltip disabled={!isSyncing} content={t('viewer.waitingForDocumentEdit')}>
      <MenuItem
        disabled={isSyncing}
        onClick={() => onClick(renderParams)}
        data-cy="customize_fields"
        leftSection={<Icomoon size={IconSize.lg} type="pencil-lg" />}
        activated={renderParams.isOpen}
        data-lumin-btn-name={ButtonName.FORM_BUILDER_OPEN}
        closeMenuOnClick={!renderParams.shouldShowPremiumIcon && renderParams.isToolAvailable}
      >
        <div className={styles.menuItemContainer}>
          {t('viewer.formFieldDetection.toolMenu.customizeFields')}
          {renderParams.shouldShowPremiumIcon && <SvgElement content="badge_premium" />}
        </div>
      </MenuItem>
    </PlainTooltip>
  );

  if (isInToolbarPopover && !isToolAvailable) {
    return renderMenuItem({ toggleCheckPopper, shouldShowPremiumIcon, isToolAvailable, withToolbarPopover: true });
  }

  return (
    <AvailabilityToolCheckProvider
      toolName={TOOLS_NAME.FORM_BUILDER}
      eventName={PremiumToolsPopOverEvent.FormBuilder}
      popperPlacement="right-start"
      popperContainerWidth={304}
      useModal
      onClose={onCleanUp}
      render={(renderParams: IToolPopperRenderParams) => renderMenuItem(renderParams)}
    />
  );
};

export default withValidUserCheck(FormBuilderCustomizeItem, TOOLS_NAME.FORM_BUILDER);
