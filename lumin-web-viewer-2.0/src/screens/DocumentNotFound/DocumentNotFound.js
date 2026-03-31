import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Link } from 'react-router-dom';

import { BadRequestPage } from '@new-ui/components/BadRequestPage';

import DocumentNotFoundImageDark from 'assets/images/dark-document-not-found.svg';
import DocumentNotFoundImage from 'assets/images/document-not-found-new.svg';

import selectors from 'selectors';

import { LayoutSecondary } from 'lumin-components/Layout';

import { useGetImageByTheme } from 'hooks/useGetImageByTheme';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { ButtonBadRequestPage, BadRequestPageType } from 'constants/badRequestPage';
import { ORG_TEXT } from 'constants/organizationConstants';
import { STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from './DocumentNotFound.styled';

function DocumentNotFound() {
  const { t } = useTranslation();
  const documentNotFoundImage = useGetImageByTheme(DocumentNotFoundImage, DocumentNotFoundImageDark);
  const { isTemplateViewer } = useTemplateViewerMatch();
  const currentUser = useShallowSelector(selectors.getCurrentUser);

  const redirectUrl =
    isTemplateViewer && currentUser?.lastAccessedOrgUrl
      ? `/${ORG_TEXT}/${currentUser.lastAccessedOrgUrl}/templates`
      : '/documents';
  const contextTranslate = isTemplateViewer ? 'template' : null;
  const renderFooterButtons = () => (
    <>
      <Button
        {...ButtonBadRequestPage.TextLargeSystem}
        component="a"
        href={`${STATIC_PAGE_URL}/guide`}
        target="_blank"
        className="flex-start"
      >
        {t('documentNotFound.guide')}
      </Button>
      <Button component={Link} {...ButtonBadRequestPage.FilledLargeSystem} to={redirectUrl} replace>
        {t('documentNotFound.goToDocuments', { context: contextTranslate })}
      </Button>
    </>
  );

  const renderSupportLink = () => (
    <Styled.SupportWrapper>
      <Styled.TroubleMessage>{t('documentNotFound.trouble')}</Styled.TroubleMessage>
      <Styled.SupportLink href={`${STATIC_PAGE_URL}/contact-support`} target="_blank" rel="noopener noreferrer" as="a">
        {t('documentNotFound.support')}
      </Styled.SupportLink>
    </Styled.SupportWrapper>
  );

  return (
    <LayoutSecondary footer={false} staticPage badRequestLayout supportLink={renderSupportLink()}>
      <BadRequestPage
        id={BadRequestPageType.DocumentNotFound}
        title={t('documentNotFound.title', { context: contextTranslate })}
        image={documentNotFoundImage}
        description={t('documentNotFound.message', { text: 'Lumin', context: contextTranslate })}
        buttons={renderFooterButtons()}
        flexEnd={false}
      />
    </LayoutSecondary>
  );
}

export default DocumentNotFound;
