import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import selectors from 'selectors';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { LayoutSecondary } from 'lumin-components/Layout';
import CustomHeader from 'luminComponents/CustomHeader';

import { useTranslation } from 'hooks';

import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import { Routers } from 'constants/Routers';

import NotFoundImage from '../../../assets/images/crash.svg';

import * as Styled from './NotFound.styled';

function NotFound() {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const organizationList = useSelector(selectors.getOrganizationList, shallowEqual).data || [];
  const isOffline = useSelector(selectors.isOffline);
  const { lastAccessedOrgUrl } = currentUser || {};

  const getNavigateUrl = () => {
    if (isOffline) {
      return Routers.PERSONAL_DOCUMENT;
    }

    const found = organizationList.find((org) => org.organization.url === lastAccessedOrgUrl);
    if (!found) {
      return Routers.PERSONAL_DOCUMENT;
    }

    return getDefaultOrgUrl({ orgUrl: lastAccessedOrgUrl });
  };

  const { t } = useTranslation();

  return (
    <>
      <CustomHeader title={t('notFound.title')} />
      <LayoutSecondary footer={false} staticPage>
        <Styled.NotFoundContainer>
          <Styled.ImageContainer>
            <Styled.NotFoundImage src={NotFoundImage} />
          </Styled.ImageContainer>
          <Styled.Title>{t('notFound.title')}</Styled.Title>
          <Styled.Message>{t('notFound.discription')}</Styled.Message>
          <Styled.ButtonDocument size={ButtonSize.XL} component={Link} to={getNavigateUrl()}>
            {t('notFound.goToDocuments')}
          </Styled.ButtonDocument>
        </Styled.NotFoundContainer>
      </LayoutSecondary>
    </>
  );
}

export default NotFound;
