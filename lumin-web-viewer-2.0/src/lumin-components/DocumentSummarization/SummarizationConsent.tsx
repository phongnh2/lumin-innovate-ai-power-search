import { Button } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import SummarizeConsent from 'assets/images/summarize-consent.svg';

import { AI_Partner } from 'features/DocumentSummarization/constants';

import { Routers } from 'constants/Routers';
import { STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from './DocumentSummarization.styled';

interface ISummarizationConsent {
  onAgree: () => void;
}

interface IRenderConsentItem {
  title: string;
  url: string;
}

const SummarizationConsent = (props: ISummarizationConsent) => {
  const { onAgree } = props;
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);

  const renderConsentItem = (consentItemProps: IRenderConsentItem): JSX.Element => {
    const { title, url } = consentItemProps;
    return (
      <Styled.AdvanceListItem>
        <Styled.Text>
          {t(`viewer.summarization.consent.${title}.label`)}:{' '}
          <Trans
            i18nKey={`viewer.summarization.consent.${title}.desc`}
            components={{ Link: <Styled.ConsentLink target="_blank" href={url} /> }}
            values={{ partnerAI: AI_Partner.name }}
          />
        </Styled.Text>
      </Styled.AdvanceListItem>
    );
  };

  return (
    <Styled.ConsentWrapper>
      <Styled.Image src={SummarizeConsent} alt="summarize-consent" />
      <Styled.Text>{t('viewer.summarization.consent.head')}</Styled.Text>
      <Styled.List>
        {renderConsentItem({ title: 'dataHandling', url: `${STATIC_PAGE_URL}${Routers.PRIVACY_POLICY}` })}
        {renderConsentItem({ title: 'privacyAndSecurity', url: null })}
        {renderConsentItem({ title: 'thirdParty', url: AI_Partner.link })}
      </Styled.List>
      <Styled.Text>{t('viewer.summarization.consent.bottom.title')}</Styled.Text>
      <Styled.CheckboxGroup>
        <Styled.Box type="checkbox" onChange={() => setIsChecked(!isChecked)} />
        <Styled.Text>
          <Trans
            i18nKey="viewer.summarization.consent.bottom.checkbox"
            components={{
              Link: <Styled.ConsentLink target="_blank" href={`${STATIC_PAGE_URL}${Routers.TERMS_OF_USE}`} />,
            }}
          />
        </Styled.Text>
      </Styled.CheckboxGroup>
      <Button disabled={!isChecked} size="lg" variant="tonal" onClick={onAgree}>
        {t('common.continue')}
      </Button>
    </Styled.ConsentWrapper>
  );
};

export default SummarizationConsent;
