/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';

import { useTranslation } from 'hooks';
import ConnectionWorld from 'assets/images/world.png';
import ChangeWorld from 'assets/images/change_world.svg';
import EmpoweringFuture from 'assets/images/empowering_future.svg';
import TransparencyFundamental from 'assets/images/transparency_fundamental.svg';

import * as Styled from './PricingValue.styled';

const PRICING_VALUE_ICONS = [
  {
    key: 'changeWorld',
    icon: ChangeWorld,
  },
  {
    key: 'empoweringFuture',
    icon: EmpoweringFuture,
  },
  {
    key: 'transparencyFundamental',
    icon: TransparencyFundamental,
  },
];

const PricingValue = (): JSX.Element => {
  const { t } = useTranslation();
  const pricingContents = t('plan.pricingValues.contents', { returnObjects: true }) as [
    { title: string; description: string }
  ];
  const PricingValues = pricingContents.map((content, index) => ({ ...content, ...PRICING_VALUE_ICONS[index] }));
  return (
    <Styled.Container>
      <Styled.Wrapper>
        <Styled.Title>{t('plan.pricingValues.title')}</Styled.Title>
        <Styled.ContentContainer>
          <Styled.LeftContent>
            {PricingValues.map((value, index) => (
              <Styled.ValueItem key={index}>
                <Styled.Icon src={value.icon} alt={value.key} />
                <Styled.ContentWrapper>
                  <Styled.ContentTitle>{value.title}</Styled.ContentTitle>
                  <Styled.Description>{value.description}</Styled.Description>
                </Styled.ContentWrapper>
              </Styled.ValueItem>
            ))}
          </Styled.LeftContent>
          <Styled.RightContent>
            <Styled.ImageWrapper>
              <Styled.Image src={ConnectionWorld} alt="banner" />
            </Styled.ImageWrapper>
          </Styled.RightContent>
        </Styled.ContentContainer>
      </Styled.Wrapper>
    </Styled.Container>
  );
};

export default PricingValue;
