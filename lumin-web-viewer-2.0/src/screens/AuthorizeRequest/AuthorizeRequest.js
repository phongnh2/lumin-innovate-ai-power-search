import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import AuthorizeRequestImage from 'assets/images/cannot-open-document.svg';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { LayoutSecondary } from 'lumin-components/Layout';

import { useTranslation } from 'hooks';

import { kratosService } from 'services/oryServices';
import { KratosRoutes } from 'services/oryServices/kratos';

import { Routers } from 'constants/Routers';
import { BASEURL } from 'constants/urls';

import * as Styled from './AuthorizeRequest.styled';

const propTypes = {
  navigate: PropTypes.func,
  currentUser: PropTypes.object,
  location: PropTypes.object,
};

const defaultProps = {
  navigate: () => {},
  currentUser: {},
  location: {},
};

function AuthorizeRequest({ currentUser, navigate, location }) {
  const { t } = useTranslation();
  const params = new URLSearchParams(location.search);
  const documentId = params.get('docId');
  const requesterId = params.get('requesterId');
  const from = params.get('from') || '';
  const referer = params.get('referer');
  let continueUrl = referer
    ? `/viewer/${documentId}?referer=${referer}&from=${from}`
    : `/viewer/${documentId}?from=${from}`;
  if (requesterId) {
    continueUrl = `/viewer/${documentId}?requesterId=${requesterId}&action=request_access&from=${from}`;
  }

  useEffect(() => {
    if (currentUser) {
      navigate('/');
      return;
    }
    if (!documentId) {
      kratosService.signIn({ url: `${BASEURL}${Routers.DOCUMENTS}` });
    }
  }, []);
  const handleSignIn = () => {
    kratosService.toKratos(KratosRoutes.SIGN_IN, { url: `${BASEURL}${continueUrl}` });
  };
  return (
    <LayoutSecondary footer={false} staticPage>
      <Styled.AuthorizationContainer>
        <Styled.AuthorizationImage
          src={AuthorizeRequestImage}
          className="AuthorizeRequest__img"
          alt="AuthorizeRequestImage"
        />
        <Styled.Title>{t('authorizeRequest.title')}</Styled.Title>
        <Styled.Message>{t('authorizeRequest.description')}</Styled.Message>
        <Styled.ButtonAuthorization size={ButtonSize.LG} onClick={handleSignIn}>
          {t('authorizeRequest.signInNow')}
        </Styled.ButtonAuthorization>
      </Styled.AuthorizationContainer>
    </LayoutSecondary>
  );
}
AuthorizeRequest.propTypes = propTypes;
AuthorizeRequest.defaultProps = defaultProps;

export default AuthorizeRequest;
