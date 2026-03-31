/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import selectors from 'selectors';

import Benefits from 'lumin-components/Benefits';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useTranslation } from 'hooks';

import { ADDITIONAL_INFO_CONTENT_TOOLTIP, LIMIT_DOCUMENT_CONTENT_TOOLTIP } from 'constants/detailPlanConstants';
import { LANGUAGES } from 'constants/language';
import { Plans } from 'constants/plan';
import { Colors } from 'constants/styles';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { IOrganization } from 'interfaces/organization/organization.interface';

import * as Styled from './PlanBox.styled';

type DataTypes = {
  key: string;
  popular: boolean;
  title: string;
  iconTitle: string;
  buttonColor: ButtonColor;
  description: string;
  subDescription: string;
  price: number;
  timePrice: string;
  underlinePrice: boolean;
  buttonText: string;
  buttonUrl: string;
  subButton: string;
  subButtonUrl: string;
  benefitIntro: string;
  benefitList: [string];
  warning: string;
  docstack: {
    key: string;
    interpolation: Record<string, unknown>;
  };
  unlimit: string;
};

const PlanBox = ({ theme, data }: { theme: any; data: DataTypes }): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentOrganization } = useSelector<unknown, { data: IOrganization }>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const language = useSelector(selectors.getLanguage);
  const isEnglish = language === LANGUAGES.EN;

  const { _id: orgId } = currentOrganization || {};
  const {
    key,
    popular,
    title,
    iconTitle,
    description,
    buttonColor,
    price,
    timePrice,
    buttonText,
    buttonUrl,
    subButton,
    subButtonUrl,
    benefitIntro,
    benefitList,
    subDescription,
    warning,
    docstack,
    unlimit,
  } = data;

  const benefits = t(benefitList, { returnObjects: true }) as [string];

  const paymentUrl =
    key !== Plans.FREE && orgId ? `${subButtonUrl}?${UrlSearchParam.PAYMENT_ORG_TARGET}=${orgId}` : subButtonUrl;

  const renderCTAButton = (): JSX.Element => {
    const trialUrl =
      key !== Plans.FREE && orgId ? `${buttonUrl}?${UrlSearchParam.PAYMENT_ORG_TARGET}=${orgId}` : buttonUrl;
    return (
      <Styled.Button
        color={buttonColor}
        size={{
          mobile: ButtonSize.MD,
          tablet: ButtonSize.XL,
          desktop: ButtonSize.MD,
        }}
        fullWidth
        $popular={popular}
        component={Link}
        to={trialUrl}
      >
        {t(buttonText)}
      </Styled.Button>
    );
  };

  const renderLimitedDocument = (): JSX.Element => (
    // @ts-ignore
    <Tooltip title={t(LIMIT_DOCUMENT_CONTENT_TOOLTIP)}>
      <Styled.LimitedDocument $isEnglish={isEnglish}>{t(docstack.key, docstack.interpolation)}</Styled.LimitedDocument>
    </Tooltip>
  );

  return (
    <ThemeProvider theme={theme}>
      <Styled.Container $popular={popular}>
        {popular && (
          <Styled.MostPopular>
            <Styled.Text>{t('plan.planBox.mostPopular')}</Styled.Text>
          </Styled.MostPopular>
        )}
        <Styled.ContentContainer>
          <Styled.Wrapper>
            <Styled.TopContentContainer>
              <Styled.WordContainer>
                <Styled.TitleWrapper>
                  <Styled.Title>{title}</Styled.Title>
                  {/* @ts-ignore */}
                  <Styled.TitleIcon className={`icon-${iconTitle}`} size={16} />
                </Styled.TitleWrapper>
                <Styled.Description>{t(description)}</Styled.Description>
                <Styled.SubDescription>{t(subDescription)}</Styled.SubDescription>
                <Styled.Divider />
              </Styled.WordContainer>
              <Styled.PricingContainer $warning={warning}>
                <Styled.Pricing>{price}</Styled.Pricing>
                <Styled.Time>{t(timePrice)}</Styled.Time>
                {warning && <Styled.Warning>{t(warning)}</Styled.Warning>}
              </Styled.PricingContainer>
              <Styled.ButtonContainer>
                {renderCTAButton()}
                {subButton && (
                  <Styled.SubButtonContainer>
                    <Styled.SubButton to={paymentUrl}>{t(subButton)}</Styled.SubButton>
                  </Styled.SubButtonContainer>
                )}
              </Styled.ButtonContainer>
            </Styled.TopContentContainer>
            <Styled.LimitedPlan>
              {renderLimitedDocument()}
              <Styled.LimitedDivider $isEnglish={isEnglish} />
              <Styled.LimitedCollaborator>{t(unlimit)}</Styled.LimitedCollaborator>
              <Styled.AdditionalInfoTooltip title={t(ADDITIONAL_INFO_CONTENT_TOOLTIP)}>
                <Styled.AdditionalInfoIcon className="icon-empty-info" size={16} color={Colors.NEUTRAL_60} />
              </Styled.AdditionalInfoTooltip>
            </Styled.LimitedPlan>
            {benefitIntro && <Styled.BenefitIntro>{t(benefitIntro)}</Styled.BenefitIntro>}
            <Styled.BenefitList $benefitListLength={benefits.length}>
              <Benefits benefits={benefits} />
            </Styled.BenefitList>
          </Styled.Wrapper>
        </Styled.ContentContainer>
      </Styled.Container>
    </ThemeProvider>
  );
};

export default PlanBox;
