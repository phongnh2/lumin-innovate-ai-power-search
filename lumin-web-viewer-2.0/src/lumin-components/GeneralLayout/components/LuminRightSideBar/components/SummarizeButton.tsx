import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { LayoutElements } from '@new-ui/constants';
import Divider from '@new-ui/general-components/Divider';
import LegacyIconButton from '@new-ui/general-components/IconButton';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useTranslation } from 'hooks/useTranslation';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useEnabledSummarization } from 'features/DocumentSummarization';

import { useToggleRightSideBarTool } from '../hooks/useToggleRightSideBarTool';
import styles from '../RightSideBarContent.module.scss';

const SummarizeButton = () => {
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const isInAnonymousMode = !currentUser;
  const { showSummarizeRightSideBar } = useEnabledSummarization();
  const { isActiveSummarizationButton, enabledRightSideBarTool, onChangeLayout } = useToggleRightSideBarTool();

  if (!showSummarizeRightSideBar) {
    return null;
  }

  return (
    <>
      <PlainTooltip content={t('viewer.summarization.tooltip')} position="left">
        <LegacyIconButton
          data-lumin-btn-name={ButtonName.SUMMARIZE_DOCUMENT}
          data-lumin-btn-purpose={ButtonPurpose.DOCUMENT_SUMMARIZE_RIGHT_SIDE_BAR_BUTTON}
          className={`summarize-btn-${enabledRightSideBarTool && !isInAnonymousMode ? 'active' : ''}`}
          icon="lg_ai_gen"
          size="large"
          iconSize={24}
          active={isActiveSummarizationButton}
          onClick={ToolSwitchableChecker.createToolSwitchableHandler(() => {
            onChangeLayout(LayoutElements.SUMMARIZATION);
          })}
          disabled={!enabledRightSideBarTool || isInAnonymousMode}
        />
      </PlainTooltip>
      <div className={styles.dividerWrapper}>
        <Divider />
      </div>
    </>
  );
};

export default SummarizeButton;
