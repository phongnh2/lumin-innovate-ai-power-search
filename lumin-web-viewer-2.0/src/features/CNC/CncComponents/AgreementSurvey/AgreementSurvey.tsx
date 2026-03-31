import classNames from 'classnames';
import { Paper } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';

import { DocumentQueryRetriever } from 'luminComponents/DocumentQuery/DocumentQueryProxy';

import { useGetFolderType } from 'hooks';

import {
  useOpenAgreementSurvey,
  useTrackEventAgreementSurvey,
  useRestrictAgreementGenFeatures,
} from 'features/CNC/hooks';

import { IDocumentBase } from 'interfaces/document/document.interface';

import AgreementSurveyContent from './components/AgreementSurveyContent';
import AgreementThankYouMessage from './components/AgreementThankYouMessage';
import AgreementPromptModal from '../AgreementPromptModal';

import styles from './AgreementSurvey.module.scss';

const NUMBER_OF_DOCUMENTS_THRESHOLD = 3;

const AgreementSurvey = (): React.ReactNode => {
  const currentFolderType = useGetFolderType();
  const { commonDocuments, firstFetching } = DocumentQueryRetriever(currentFolderType, {
    orgId: null,
    teamId: null,
  }) as {
    commonDocuments: Record<string, IDocumentBase>;
    firstFetching: boolean;
  };
  const currentLength = Object.keys(commonDocuments).length;
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    if (shouldRender || firstFetching) return;
    if (currentLength <= NUMBER_OF_DOCUMENTS_THRESHOLD) {
      setShouldRender(true);
    }
  }, [currentLength, shouldRender, firstFetching]);

  const { trackModalViewed, trackModalDismiss, trackSurveyResponse } = useTrackEventAgreementSurvey();
  const { isAgreementGenFeaturesRestricted } = useRestrictAgreementGenFeatures();

  const {
    isOpenAgreementSurvey,
    isOpenAgreementThankYouMessage,
    isOpenAgreementPromptModal,
    onCloseAgreementSurvey,
    onOpenThankYouMessage,
  } = useOpenAgreementSurvey();

  const handleCloseAgreementSurvey = () => {
    onCloseAgreementSurvey();
    trackModalDismiss().catch(() => {});
  };

  const renderContent = () => {
    switch (true) {
      case isOpenAgreementThankYouMessage:
        return <AgreementThankYouMessage />;
      case isOpenAgreementSurvey:
        return (
          <AgreementSurveyContent
            onCloseAgreementSurvey={onCloseAgreementSurvey}
            onOpenThankYouMessage={onOpenThankYouMessage}
            trackModalViewed={trackModalViewed}
            trackSurveyResponse={trackSurveyResponse}
            handleCloseAgreementSurvey={handleCloseAgreementSurvey}
          />
        );
      default:
        return null;
    }
  };

  if (
    (!isOpenAgreementSurvey && !isOpenAgreementThankYouMessage && !isOpenAgreementPromptModal) ||
    !shouldRender ||
    isAgreementGenFeaturesRestricted
  ) {
    return null;
  }

  if (isOpenAgreementPromptModal) {
    return <AgreementPromptModal />;
  }

  return (
    <Paper
      elevation="sm"
      radius="lg"
      className={classNames(styles.dialogContent, {
        [styles.showContent]: isOpenAgreementSurvey || isOpenAgreementThankYouMessage,
      })}
    >
      {renderContent()}
    </Paper>
  );
};

export default AgreementSurvey;
