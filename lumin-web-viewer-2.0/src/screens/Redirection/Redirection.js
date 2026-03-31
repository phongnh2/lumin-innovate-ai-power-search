/* eslint-disable sonarjs/no-small-switch */
import Lottie from 'lottie-react';
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

import { LayoutSecondary } from 'lumin-components/Layout';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { matchPaths } from 'helpers/matchPaths';

import { isMatchOrgIdPath } from 'utils/orgUtils';

import { ORG_TEXT } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import * as Styled from './Redirection.styled';

const animationData = require('./redirection-lottie.json');

const regexRedirectOrg = new RegExp(`^\\/(?:${ORG_TEXT}|circle)\\/([a-z0-9]{24})(.*)`);

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

function Redirection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const gotoNotFound = () => {
    navigate('/notFound', { replace: true });
  };

  const handleRedirectOrg = async (redirectUrl = '') => {
    const match = matchPaths(
      ['/circle/:orgId', `/${ORG_TEXT}/:orgId`].map((route) => ({ path: route, end: false })),
      redirectUrl
    );
    if (!match) {
      gotoNotFound();
      return;
    }

    const { orgId } = match.params;
    try {
      const { orgData } = await organizationServices.getOrgById({ orgId });
      const { url: orgUrl } = orgData;

      const newUrl = redirectUrl.replace(
        regexRedirectOrg,
        (_, g1, g2) =>
          `${redirectUrl.slice(0, redirectUrl.indexOf('/') + 1)}${redirectUrl.split('/')[1]}/${orgUrl}${g2}`
      );

      navigate(newUrl, { reaplace: true });
    } catch (e) {
      gotoNotFound();
    }
  };

  const handleRedirect = () => {
    const { search } = location;
    const searchParams = new URLSearchParams(search);
    const redirectUrl = searchParams.get(UrlSearchParam.REDIRECT_URL);

    const isOrgUrl = isMatchOrgIdPath(redirectUrl);
    if (isOrgUrl) {
      handleRedirectOrg(redirectUrl);
      return;
    }

    gotoNotFound();
  };
  useEffect(() => {
    handleRedirect();
  }, [location]);

  return (
    <LayoutSecondary
      footer={false}
      staticPage
      backgroundColor={Colors.NEUTRAL_5}
    >
      <Styled.Container>
        <Styled.Wrapper>
          <Styled.ImgContainer>
            <Styled.ImgWrapper>
              <Lottie
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                {...defaultOptions}
                animationData={animationData}
              />
            </Styled.ImgWrapper>
          </Styled.ImgContainer>
          <Styled.Title>{t('redirection.title')}</Styled.Title>
          <Styled.Description>{t('redirection.description')}</Styled.Description>
        </Styled.Wrapper>
      </Styled.Container>
    </LayoutSecondary>
  );
}

export default Redirection;
