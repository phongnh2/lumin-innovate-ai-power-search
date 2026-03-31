import { ArrowsOutSimpleIcon } from '@luminpdf/icons/dist/csr/ArrowsOutSimple';
import { PaperPlaneTiltIcon } from '@luminpdf/icons/dist/csr/PaperPlaneTilt';
import { SparkleIcon } from '@luminpdf/icons/dist/csr/Sparkle';
import classNames from 'classnames';
import { Chip, Text, Button, ButtonVariant } from 'lumin-ui/kiwi-ui';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import Tooltip from 'luminComponents/Tooltip';

import { usePrevious } from 'hooks';

import { eventTracking, hotjarUtils } from 'utils';

import { MAX_DOCUMENTS_BEFORE_COLLAPSE } from 'features/CNC/constants/customConstant';
import { useGetAgreementGenInputBoxFlag, useRestrictAgreementGenFeatures } from 'features/CNC/hooks';
import { RecentDocumentsContext } from 'features/SuggestedDocuments/contexts/RecentDocuments.context';
import { TrendingDocumentsContext } from 'features/SuggestedDocuments/contexts/TrendingDocuments.context';

import { AWS_EVENTS } from 'constants/awsEvents';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';

import { ProcessingModal } from './components/ProcessingModal';
import { useHandleAGInputBox } from './hooks/useHandleAGInputBox';
import { usePrompt } from './hooks/usePrompt';

import styles from './AgreementGenInputBox.module.scss';

const AgreementGenInputBox = () => {
  const {
    handleClearPrompt,
    handleCollapse,
    isCollapsed,
    handleChange,
    handleMarkClick,
    inputBoxRef,
    onKeyDown,
    SAMPLE_PROMPTS,
    allowSubmitting,
    selectedPrompt,
  } = useHandleAGInputBox();
  const selectedPromptTitle: string | null = selectedPrompt ? selectedPrompt.title : null;
  const { createAgreementByPrompt, isProcessing } = usePrompt(inputBoxRef, selectedPromptTitle);
  const { isAgreementGenFeaturesRestricted } = useRestrictAgreementGenFeatures();

  const { state: trendingDocumentsState } = useContext(TrendingDocumentsContext);
  const { state: recentDocumentState } = useContext(RecentDocumentsContext);

  const { data } = useSelector(selectors.getCurrentOrganization);
  const { url } = data || {};
  const previousUrl = usePrevious(url, { allowNullish: false });
  const hasChangedWorkSpace = useRef(false);
  const isFetchingData = trendingDocumentsState.isFetching && recentDocumentState.isFetching;

  const shouldShowAGInputBox =
    !isFetchingData &&
    trendingDocumentsState.documents.length <= MAX_DOCUMENTS_BEFORE_COLLAPSE &&
    recentDocumentState.documents.length <= MAX_DOCUMENTS_BEFORE_COLLAPSE;

  const { enabled } = useGetAgreementGenInputBoxFlag();
  const [showAGInputBox, setShowAGInputBox] = useState(false);

  useEffect(() => {
    if (url !== previousUrl) {
      hasChangedWorkSpace.current = true;
    }
    if (isFetchingData) return;
    if (hasChangedWorkSpace.current) {
      setShowAGInputBox(shouldShowAGInputBox);
      hasChangedWorkSpace.current = false;
    }
  }, [shouldShowAGInputBox, url, previousUrl, isFetchingData]);

  useEffect(() => {
    if (showAGInputBox && enabled && !isAgreementGenFeaturesRestricted) {
      eventTracking(AWS_EVENTS.MODAL.VIEWED, { modalName: 'agreementGenInputBox' })
        .then(() => {})
        .catch(() => {});
      hotjarUtils.trackEvent(HOTJAR_EVENT.AGREEMENT_GEN_INPUT_BOX_VIEWED);
    }
  }, [enabled, showAGInputBox]);

  if (!showAGInputBox || !enabled || isAgreementGenFeaturesRestricted) {
    return null;
  }

  return (
    <>
      {isProcessing ? <ProcessingModal /> : null}
      <div className={styles.agInputBoxContainer}>
        <div className={styles.header}>
          <Text type="headline" size="lg" className={styles.title}>
            Get started, make agreements effortless
          </Text>
          <Tooltip content={isCollapsed ? 'Open in full view' : 'Collapse'}>
            <ArrowsOutSimpleIcon className={styles.collapseButton} onClick={handleCollapse} />
          </Tooltip>
        </div>

        <div className={classNames(styles.inputBoxWrapper, { [styles.collapsed]: isCollapsed })}>
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <div
            role="textbox"
            ref={inputBoxRef}
            contentEditable="plaintext-only"
            data-placeholder={allowSubmitting ? null : 'Type your prompt here'}
            className={styles.textArea}
            onInput={handleChange}
            onClick={handleMarkClick}
            onKeyDown={onKeyDown}
            tabIndex={0}
          />
          <div className={styles.ctaContainer}>
            {allowSubmitting ? (
              <Button variant={ButtonVariant.text} onClick={handleClearPrompt}>
                Clear
              </Button>
            ) : null}
            <Button
              variant={ButtonVariant.text}
              className={styles.promptSubmitButton}
              onClick={createAgreementByPrompt}
              tabIndex={0}
              onKeyDown={createAgreementByPrompt}
              leftSection={<PaperPlaneTiltIcon />}
              disabled={!allowSubmitting}
            >
              {allowSubmitting ? 'Generate' : null}
            </Button>
          </div>
          <div className={styles.defaultPromptsContainer}>
            {SAMPLE_PROMPTS.map(({ title, onClick }) => (
              <Chip
                key={title}
                onClick={onClick}
                label={`Write a ${title}`}
                className={styles.defaultPrompt}
                leftIcon={<SparkleIcon />}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AgreementGenInputBox;
