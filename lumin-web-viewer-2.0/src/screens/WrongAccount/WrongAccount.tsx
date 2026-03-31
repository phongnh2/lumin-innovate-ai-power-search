import React from 'react';
import { Trans } from 'react-i18next';
import { useLocation } from 'react-router';

import { LayoutSecondary } from 'lumin-components/Layout';
import { ButtonSize } from 'luminComponents/ButtonMaterial';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import UrlUtils from 'utils/url.utils';
import validators from 'utils/validator';

import { Colors } from 'constants/styles';
import { BASEURL } from 'constants/urls';

import * as Styled from './WrongAccount.styled';

const ALLOWED_HOST = ['accounts.google.com', 'login.microsoftonline.com'];

function WrongAccount(): JSX.Element {
  const { search } = useLocation();
  const { t } = useTranslation();
  const url = new URLSearchParams(search);
  const remoteEmail = url.get('email');
  const changeAccountUrl = url.get('change_account_url');
  const from = url.get('from');
  const isFromOneDrive = from === 'oneDrive';

  const getRedirectUrl = () => {
    if (!changeAccountUrl) {
      return BASEURL;
    }

    const decodedUrl = decodeURIComponent(decodeURIComponent(changeAccountUrl));
    const sanitizedURL = UrlUtils.sanitizeURL(decodedUrl);
    if (!sanitizedURL) {
      return BASEURL;
    }

    const _url = new URL(sanitizedURL);
    if (ALLOWED_HOST.includes(_url.host) || validators.validateWhitelistUrl(sanitizedURL)) {
      return decodeURIComponent(changeAccountUrl);
    }

    return BASEURL;
  };

  return (
    <Styled.Wrapper>
      <LayoutSecondary footer={false} staticPage backgroundColor={Colors.NEUTRAL_5}>
        <Styled.Container>
          <Styled.Frame>
            <Styled.Title>{t('openDrive.wrongAccount')}</Styled.Title>
            <Styled.Svg content={isFromOneDrive ? 'wrong-onedrive-account' : 'wrong-drive-account'} width="100%" />
            <Styled.Text>
              <Trans
                i18nKey="openDrive.loginAnotherAccount"
                components={{ b: <b /> }}
                values={{ remoteEmail, loginService: isFromOneDrive ? 'Microsoft' : 'Google' }}
              />
            </Styled.Text>
            <Styled.Button
              href={getRedirectUrl()}
              data-lumin-btn-name={
                isFromOneDrive ? ButtonName.MICROSOFT_ACCOUNT_CHANGE : ButtonName.GOOGLE_DRIVE_ACCOUNT_CHANGE
              }
              size={{
                mobile: ButtonSize.MD,
                tablet: ButtonSize.XL,
              }}
            >
              {t('openDrive.changeAccount')}
            </Styled.Button>
          </Styled.Frame>
        </Styled.Container>
      </LayoutSecondary>
    </Styled.Wrapper>
  );
}

export default WrongAccount;
