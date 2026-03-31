import { get } from 'lodash';
import { Icomoon, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import AIToolSection from '@new-ui/components/LuminToolbar/tools-components/AITool/AIToolSection';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useIsSystemFile } from 'hooks/useIsSystemFile';
import { useTranslation } from 'hooks/useTranslation';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { MAXIMUM_FILE_SIZE_FOR_EDIT_IN_AGREEMENT_GEN_IN_MB } from '../../constants';
import { useEnableEditInAgreementGen } from '../../hooks/useEnableEditInAgreementGen';
import { useTryAgreementGen } from '../../hooks/useTryAgreementGen';
import { openEditInAgreementGenModal } from '../../slices';

import styles from './EditInAgreementGenButton.module.scss';

interface EditInAgreementGenButtonProps {
  toolValidateCallback: () => boolean;
  showSectionTitle?: boolean;
}

const EditInAgreementGenButton = ({
  toolValidateCallback,
  showSectionTitle = false,
}: EditInAgreementGenButtonProps) => {
  const dispatch = useDispatch();
  const { enabled, enabledForPromptSignIn } = useEnableEditInAgreementGen();
  const { t } = useTranslation();
  const { isSystemFile } = useIsSystemFile();
  const currentUser = useGetCurrentUser();
  const hasShownEditInAgreementGenModal = get(currentUser, 'metadata.hasShownEditInAgreementGenModal');
  const { tryAgreementGen } = useTryAgreementGen();

  const handleClickTryAgreementGen = async () => {
    if (hasShownEditInAgreementGenModal) {
      await tryAgreementGen();
      return;
    }

    dispatch(openEditInAgreementGenModal());
  };

  const handleClickMenuItem = () => {
    ToolSwitchableChecker.createToolSwitchableHandler(() => {
      if (toolValidateCallback()) {
        handleClickTryAgreementGen().catch(() => {});
      }
    })();
  };

  const renderEditInAgreementGenButton = () => (
    <PlainTooltip
      content={
        !enabled && !enabledForPromptSignIn && !isSystemFile
          ? t('viewer.editInAgreementGen.preConditionNotMeetTooltip', {
              size: MAXIMUM_FILE_SIZE_FOR_EDIT_IN_AGREEMENT_GEN_IN_MB,
            })
          : ''
      }
      position="bottom"
      maw={280}
    >
      <span>
        <MenuItem
          leftSection={<Icomoon size="lg" type="lm-agreement-gen" color="var(--kiwi-colors-surface-on-surface)" />}
          onClick={handleClickMenuItem}
          py="var(--kiwi-spacing-0-5)"
          data-lumin-btn-name={ButtonName.EDIT_IN_AGREEMENT_GEN}
          data-lumin-btn-purpose={ButtonPurpose[ButtonName.EDIT_IN_AGREEMENT_GEN]}
          closeMenuOnClick={Boolean(currentUser)}
          disabled={(!enabled && !enabledForPromptSignIn) || isSystemFile}
        >
          <div className={styles.wrapper}>
            <p>AgreementGen</p>
            <p className={styles.betaLabel}>AI beta</p>
          </div>
        </MenuItem>
      </span>
    </PlainTooltip>
  );

  if (!showSectionTitle) {
    return renderEditInAgreementGenButton();
  }

  return (
    <AIToolSection sectionTitle={t('viewer.editInAgreementGen.sectionTitle')}>
      {renderEditInAgreementGenButton()}
    </AIToolSection>
  );
};

export default EditInAgreementGenButton;
