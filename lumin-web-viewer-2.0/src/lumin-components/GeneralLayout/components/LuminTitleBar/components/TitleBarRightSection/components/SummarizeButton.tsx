import classNames from 'classnames';
import { Button, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { LayoutElements } from '@new-ui/constants';

import selectors from 'selectors';

import SummarizationUpgradePopper from 'luminComponents/DocumentSummarization/SummarizationUpgradePopper';
import Icomoon from 'luminComponents/Icomoon';

import fireEvent from 'helpers/fireEvent';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useEnabledSummarization } from 'features/DocumentSummarization';
import { readAloudSelectors } from 'features/ReadAloud/slices';

import { CUSTOM_EVENT } from 'constants/customEvent';

import styles from './SummarizeButton.module.scss';

const SummarizeButton = () => {
  const { t } = useTranslation();
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const isDefaultMode = useSelector(selectors.isDefaultMode);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isOpenPopper, setIsOpenPopper] = useState(false);

  const { canSummary } = useEnabledSummarization();

  const onSummarizeClick = () => {
    if (canSummary) {
      fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
        elementName: LayoutElements.SUMMARIZATION,
        isOpen: !isRightPanelOpen,
      });
    } else {
      setIsOpenPopper(true);
    }
  };

  return (
    <>
      <PlainTooltip content={t('viewer.summarization.tooltip')} position="bottom">
        <Button
          className={styles.button}
          size="lg"
          data-lumin-btn-name={ButtonName.SUMMARIZE_DOCUMENT}
          onClick={ToolSwitchableChecker.createToolSwitchableHandler(onSummarizeClick)}
          ref={buttonRef}
          disabled={!isDefaultMode || isInReadAloudMode}
        >
          <Icomoon className={classNames('lg_sparkles', styles.icon)} size={24} />
          <span>{t('viewer.summarization.headerButton')}</span>
        </Button>
      </PlainTooltip>
      <SummarizationUpgradePopper
        openPopper={isOpenPopper}
        anchorRef={buttonRef.current}
        onClosePopper={() => setIsOpenPopper(false)}
      />
    </>
  );
};

export default SummarizeButton;
