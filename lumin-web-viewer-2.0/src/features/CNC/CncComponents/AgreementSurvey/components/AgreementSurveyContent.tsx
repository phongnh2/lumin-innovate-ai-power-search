import { Text, Chip, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';

import AgreementSurveyIcon from 'assets/lumin-svgs/icon-agreement-survey.svg';

import { useAgreementSectionStore } from 'features/CNC/hooks/useAgreementSectionStore';

import styles from '../AgreementSurvey.module.scss';

const AgreementSurveyContent = ({
  onCloseAgreementSurvey,
  onOpenThankYouMessage,
  trackModalViewed,
  trackSurveyResponse,
  handleCloseAgreementSurvey,
}: {
  onCloseAgreementSurvey: () => void;
  onOpenThankYouMessage: () => void;
  trackModalViewed: () => void;
  trackSurveyResponse: (answer: string) => void;
  handleCloseAgreementSurvey: () => void;
}) => {
  const { setIsOpenAgreementSection } = useAgreementSectionStore();

  const handleOpenAgreementSection = (answer: string) => {
    onCloseAgreementSurvey();
    setIsOpenAgreementSection(true);
    trackSurveyResponse(answer);
  };

  const handleOpenThankYouMessage = (answer: string) => {
    onCloseAgreementSurvey();
    onOpenThankYouMessage();
    trackSurveyResponse(answer);
  };

  useEffect(() => {
    trackModalViewed();
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.headerContainer}>
        <img src={AgreementSurveyIcon} alt="Agreement Survey" className={styles.icon} />
        <IconButton
          size="md"
          icon="x-lg"
          onClick={handleCloseAgreementSurvey}
          iconColor="var(--kiwi-colors-surface-on-surface)"
        />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.header}>
          <Text type="label" size="sm" color="var(--kiwi-colors-surface-on-surface-low)">
            We’d love to tailor your experience better
          </Text>
          <Text type="headline" size="sm" color="var(--kiwi-colors-surface-on-surface)">
            How often do you work with agreements?
          </Text>
        </div>
        <div className={styles.body}>
          <Chip
            label="I often work with it"
            variant="light"
            colorType="grey"
            size="sm"
            enablePointerEvents
            onClick={() => handleOpenAgreementSection('I often work with it')}
          />
          <Chip
            label="I rarely work with it"
            variant="light"
            colorType="grey"
            size="sm"
            enablePointerEvents
            onClick={() => handleOpenAgreementSection('I rarely work with it')}
          />
          <Chip
            label="I have never worked with it"
            variant="light"
            colorType="grey"
            size="sm"
            enablePointerEvents
            onClick={() => handleOpenThankYouMessage('I have never worked with it')}
          />
        </div>
      </div>
    </div>
  );
};

export default AgreementSurveyContent;
