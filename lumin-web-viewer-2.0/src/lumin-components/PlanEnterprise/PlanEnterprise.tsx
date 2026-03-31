/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';

import EnterpriseDeskstop from 'assets/images/enterprise-desktop.png';
import Enterprise from 'assets/images/enterprise-tablet-mobile.png';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { ButtonColor } from 'luminComponents/ButtonMaterial/types/ButtonColor';

import { useDesktopMatch, useTranslation } from 'hooks';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from './PlanEnterprise.styled';

export const LuminEnterprise = (): JSX.Element => {
  const { t } = useTranslation();
  const isDesktop = useDesktopMatch();
  const srcImage = isDesktop ? EnterpriseDeskstop : Enterprise;
  return (
    <Styled.LuminEnterpriseContainer>
      <Styled.IntroductionWrapper>
        <Styled.Introduction>{t('plan.planEnterprise.introduce')}</Styled.Introduction>
      </Styled.IntroductionWrapper>
      <Styled.Box>
        <Styled.Banner alt="Enterprise" src={srcImage} />
        <Styled.ContentContainer>
          <Styled.Title>{t('plan.planEnterprise.title')}</Styled.Title>
          <Styled.Description>{t('plan.planEnterprise.description')}</Styled.Description>
          <Styled.ButtonWrapper>
            <Styled.RightButton
              size={{
                tablet: ButtonSize.MD,
                desktop: ButtonSize.XL,
              }}
              color={ButtonColor.PRIMARY_BLACK}
              href={(STATIC_PAGE_URL ) + getFullPathWithPresetLang(t('url.saleSupport.contactSale'))}
            >
              {t('plan.planEnterprise.talkToSales')}
            </Styled.RightButton>
          </Styled.ButtonWrapper>
        </Styled.ContentContainer>
      </Styled.Box>
    </Styled.LuminEnterpriseContainer>
  );
};

export default LuminEnterprise;
