import { ArrowSquareOutIcon } from '@luminpdf/icons/dist/csr/ArrowSquareOut';
import { Text, Button, ButtonVariant, Divider, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';

import { useGetCurrentOrganization, usePersonalDocPathMatch, useTrackingModalEvent } from 'hooks';

import { EXAMPLES_PROMPT_AGREEMENT } from 'features/CNC/constants/agreementGenConstants';
import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import { CNCModalName, CNCModalPurpose } from 'features/CNC/constants/events/modal';
import { useRestrictAgreementGenFeatures } from 'features/CNC/hooks';
import { useAgreementSectionStore } from 'features/CNC/hooks/useAgreementSectionStore';
import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { ORG_TEXT } from 'constants/organizationConstants';
import { AGREEMENT_GEN_APP_URL } from 'constants/urls';

import styles from './AgreementSection.module.scss';

const AgreementSection = () => {
  const currentOrg = useGetCurrentOrganization();
  const { isOpenAgreementSection, setIsOpenAgreementSection, setIsOpenAgreementPromptModal, setSelectedPrompt } =
    useAgreementSectionStore();
  const isPersonalDocumentsRoute = usePersonalDocPathMatch();
  const { isVisible: isChatbotVisible } = useChatbotStore();
  const { isAgreementGenFeaturesRestricted } = useRestrictAgreementGenFeatures();

  const { trackModalViewed, trackModalDismiss } = useTrackingModalEvent({
    modalName: CNCModalName.AGREEMENT_GEN_SECTION,
    modalPurpose: CNCModalPurpose[CNCModalName.AGREEMENT_GEN_SECTION],
  });
  const hasCurrentOrg = Boolean(currentOrg?.url);
  const link = hasCurrentOrg
    ? `${AGREEMENT_GEN_APP_URL}/${ORG_TEXT}/${currentOrg?.url}/documents/personal`
    : '/generate/documents/personal';

  const handleSelectPrompt = (prompt: typeof EXAMPLES_PROMPT_AGREEMENT[number]) => {
    setIsOpenAgreementSection(false);
    setIsOpenAgreementPromptModal(true);
    setSelectedPrompt(prompt);
  };

  const handleGoToAgreementGen = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleCloseAgreementSection = () => {
    setIsOpenAgreementSection(false);
    trackModalDismiss().catch(() => {});
  };

  useEffect(() => {
    trackModalViewed().catch(() => {});
  }, []);

  if (!isOpenAgreementSection || !isPersonalDocumentsRoute || isChatbotVisible || isAgreementGenFeaturesRestricted)
    return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text type="headline" size="sm" color="var(--kiwi-colors-surface-on-surface)">
          Let our AI help with your agreements!
        </Text>
        <div className={styles.buttonWrapper}>
          <Button
            size="sm"
            variant={ButtonVariant.text}
            startIcon={<ArrowSquareOutIcon />}
            colorType="lumin_sign"
            onClick={handleGoToAgreementGen}
            data-lumin-btn-name={CNCButtonName.GO_TO_AGREEMENT_GEN}
            data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.GO_TO_AGREEMENT_GEN]}
          >
            Go to AgreementGen
          </Button>
          <Divider orientation="vertical" style={{ height: 12, margin: 'auto' }} />
          <IconButton icon="ph-x" size="sm" onClick={handleCloseAgreementSection} />
        </div>
      </div>
      <div className={styles.content}>
        {EXAMPLES_PROMPT_AGREEMENT.map((prompt) => (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            key={prompt.title}
            className={styles.promptSuggestionItem}
            onClick={() => handleSelectPrompt(prompt)}
            role="button"
            tabIndex={0}
            data-lumin-btn-name={CNCButtonName.START_VIA_SAMPLE_PROMPT}
            data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.START_VIA_SAMPLE_PROMPT]}
          >
            <Text type="label" size="sm" color="var(--kiwi-colors-core-secondary)" className={styles.promptTitle}>
              {prompt.title}
            </Text>
            <img src={prompt.imgSrc} alt={prompt.title} className={styles.promptImage} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgreementSection;
