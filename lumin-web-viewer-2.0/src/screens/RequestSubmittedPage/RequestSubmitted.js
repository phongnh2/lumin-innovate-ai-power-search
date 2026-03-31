import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Link } from 'react-router-dom';

import { BadRequestPage } from '@new-ui/components/BadRequestPage';

import RequestSubmittedImageDark from 'assets/images/dark-request-submitted.svg';
import RequestSubmittedImageNew from 'assets/images/request-submitted.svg';

import { LayoutSecondary } from 'lumin-components/Layout';

import { useGetImageByTheme } from 'hooks/useGetImageByTheme';
import { useTranslation } from 'hooks/useTranslation';

import { ButtonBadRequestPage, BadRequestPageType } from 'constants/badRequestPage';

function RequestSubmitted() {
  const { t } = useTranslation();
  const requestSubmittedImage = useGetImageByTheme(RequestSubmittedImageNew, RequestSubmittedImageDark);
  const renderFooterButtons = () => (
    <Button component={Link} {...ButtonBadRequestPage.FilledLargeSystem} to="/">
      {t('requestSubmitted.goBack')}
    </Button>
  );

  return (
    <LayoutSecondary footer={false} staticPage badRequestLayout>
      <BadRequestPage
        id={BadRequestPageType.RequestSubmitted}
        title={t('requestSubmitted.title')}
        image={requestSubmittedImage}
        description={t('requestSubmitted.description')}
        buttons={renderFooterButtons()}
        flexEnd
      />
    </LayoutSecondary>
  );
}

export default RequestSubmitted;
