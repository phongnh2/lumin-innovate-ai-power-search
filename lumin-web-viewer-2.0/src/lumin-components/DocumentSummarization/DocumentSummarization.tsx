import { get } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutElements } from '@new-ui/constants';
import Divider from '@new-ui/general-components/Divider';
import RightPanelHeader from '@new-ui/general-components/RightPanelHeader/RightPanelHeader';

import selectors from 'selectors';

import AppCircularLoading from 'luminComponents/AppCircularLoading';

import useShallowSelector from 'hooks/useShallowSelector';

import fireEvent from 'helpers/fireEvent';

import { CUSTOM_EVENT } from 'constants/customEvent';

import SummarizationConsent from './SummarizationConsent';
import SummarizationContent from './SummarizationContent';

import * as Styled from './DocumentSummarization.styled';

const DocumentSummarization = () => {
  const { t } = useTranslation();

  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const consentedSummaryUser = get(currentUser, 'metadata.docSummarizationConsentGranted') as boolean;

  const closeSummarizePanel = () => {
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.DEFAULT,
      isOpen: false,
    });
  };

  const [hasConsented, setHasConsented] = useState<boolean>(consentedSummaryUser);

  const renderDocumentSummarization = () => {
    if (!hasConsented) {
      return <SummarizationConsent onAgree={() => setHasConsented(true)} />;
    }

    return <SummarizationContent />;
  };

  return (
    <Styled.Layout>
      <RightPanelHeader title={t('viewer.summarization.panel.title')} closeButton onClose={closeSummarizePanel} />
      <Divider />
      {currentUser ? renderDocumentSummarization() : <AppCircularLoading />}
    </Styled.Layout>
  );
};

export default DocumentSummarization;
