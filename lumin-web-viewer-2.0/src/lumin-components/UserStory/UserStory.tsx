/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';

import TowerImage from 'assets/images/tower.png';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { ButtonColor } from 'luminComponents/ButtonMaterial';

import { useTranslation } from 'hooks';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from './UserStory.styled';

const USER_STORY_BLOG =
  (STATIC_PAGE_URL ) +
  getFullPathWithPresetLang('/blog/case-study-benj-bongcayao-and-first-oceanic-property-management/');

const UserStory = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Styled.Container>
      <Styled.Wrapper>
        <Styled.Thumbnail>
          <Styled.ImageContainer>
            {/* @ts-ignore */}
            <Styled.Image src={TowerImage} alt="banner" />
          </Styled.ImageContainer>
        </Styled.Thumbnail>
        <Styled.InfoWrapper>
          <Styled.Heading>{t('plan.userStory.title')}</Styled.Heading>
          <Styled.Description>{t('plan.userStory.description')}</Styled.Description>
          <Styled.ButtonWrapper
            size={{
              mobile: ButtonSize.MD,
              tablet: ButtonSize.XL,
              desktop: ButtonSize.XXL,
            }}
            color={ButtonColor.SECONDARY_BLACK}
            href={USER_STORY_BLOG}
          >
            {t('plan.userStory.button')}
          </Styled.ButtonWrapper>
        </Styled.InfoWrapper>
      </Styled.Wrapper>
    </Styled.Container>
  );
};

export default UserStory;
