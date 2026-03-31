import React from 'react';

import { BadRequestPage } from '@new-ui/components/BadRequestPage';

import DocumentRateLimitImageDark from 'assets/images/dark-expired-document.svg';
import DocumentRateLimitImageNew from 'assets/images/expired-document-new.svg';

import { LayoutSecondary } from 'lumin-components/Layout';

import { useGetImageByTheme } from 'hooks/useGetImageByTheme';
import { useTranslation } from 'hooks/useTranslation';

import { BadRequestPageType } from 'constants/badRequestPage';

function DocumentRateLimit() {
  const { t } = useTranslation();
  const rateLimitImage = useGetImageByTheme(DocumentRateLimitImageNew, DocumentRateLimitImageDark);

  return (
    <LayoutSecondary footer={false} staticPage badRequestLayout>
      <BadRequestPage
        id={BadRequestPageType.DocumentExpire}
        title={t('documentRateLimit.title')}
        image={rateLimitImage}
        description={t('documentRateLimit.description')}
      />
    </LayoutSecondary>
  );
}

export default DocumentRateLimit;
