import { PaperPlaneTiltIcon } from '@luminpdf/icons/dist/csr/PaperPlaneTilt';
import { Button, ButtonVariant, Dialog, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import AgreementPromptModalIcon from 'assets/lumin-svgs/ag-icon.svg';
import AgreementGenLogo from 'assets/lumin-svgs/agreement-gen-logo.svg';

import { usePrompt, useRestrictAgreementGenFeatures } from 'features/CNC/hooks';
import { useAgreementSectionStore } from 'features/CNC/hooks/useAgreementSectionStore';

import { ProcessingModal } from '../AgreementGenInputBox/components/ProcessingModal';
import { useHandleAGInputBox } from '../AgreementGenInputBox/hooks/useHandleAGInputBox';

import styles from './AgreementPromptModal.module.scss';

const AgreementPromptModal = () => {
  const {
    handleClearPrompt,
    handleChange,
    handleMarkClick,
    inputBoxRef,
    inputBoxRefCallback,
    onKeyDown,
    allowSubmitting,
    selectedPrompt,
  } = useHandleAGInputBox();
  const { setIsOpenAgreementPromptModal } = useAgreementSectionStore();
  const { isAgreementGenFeaturesRestricted } = useRestrictAgreementGenFeatures();

  const selectedPromptTitle: string | null = selectedPrompt ? selectedPrompt.title : null;
  const { createAgreementByPrompt, isProcessing } = usePrompt(
    inputBoxRef,
    selectedPromptTitle,
    setIsOpenAgreementPromptModal
  );

  if (isAgreementGenFeaturesRestricted) {
    return null;
  }

  return (
    <>
      {isProcessing ? <ProcessingModal /> : null}
      <Dialog
        opened={!isProcessing}
        withCloseButton
        onClose={() => setIsOpenAgreementPromptModal(false)}
        withOverlay
        closeOnClickOutside={false}
        size="lg"
        padding="md"
        headerTitle={<img src={AgreementGenLogo} alt="AgreementGenLogo" className={styles.logoWrapper} />}
        headerTitleContainerProps={{
          className: styles.modalHeader,
        }}
      >
        <div className={styles.container}>
          <div className={styles.heading}>
            <div className={styles.headingContent}>
              <Text type="display" size="md" color="var(--kiwi-colors-custom-brand-sign-sign)">
                Hi
              </Text>
              <img src={AgreementPromptModalIcon} alt="AgreementGenIcon" className={styles.icon} />
            </div>
            <Text type="display" size="md" color="var(--kiwi-colors-surface-on-surface)">
              What will you create today?
            </Text>
          </div>
          <div className={styles.inputContainer}>
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <div
              role="textbox"
              ref={inputBoxRefCallback as (instance: HTMLDivElement | null) => void}
              contentEditable="plaintext-only"
              data-placeholder={allowSubmitting ? null : 'Type your prompt here'}
              className={styles.inputBox}
              onInput={handleChange}
              onKeyDown={onKeyDown}
              onClick={handleMarkClick}
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
                tabIndex={0}
                leftSection={<PaperPlaneTiltIcon />}
                disabled={!allowSubmitting}
                onClick={createAgreementByPrompt}
              >
                {allowSubmitting ? 'Generate' : null}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AgreementPromptModal;
