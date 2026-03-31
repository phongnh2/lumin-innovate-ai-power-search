/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';

import StudentImage from 'assets/images/free-student.png';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';

import { useTranslation } from 'hooks';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from './FreeStudent.styled';

const FreeStudent = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Styled.Wrapper>
      <Styled.Container>
        <Styled.Image src={StudentImage} alt="Free student" />
        <Styled.ContentContainer>
          <Styled.Title>{t('plan.freeStudent.title')}</Styled.Title>
          <Styled.Description>{t('plan.freeStudent.description')}</Styled.Description>
          <Styled.CustomButton
            size={{
              mobile: ButtonSize.LG,
              tablet: ButtonSize.XL,
              desktop: ButtonSize.XXL,
            }}
            color={ButtonColor.SECONDARY_BLACK}
            href={(STATIC_PAGE_URL ) + getFullPathWithPresetLang(t('url.freeForClassrooms'))}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('common.tryNow')}
          </Styled.CustomButton>
        </Styled.ContentContainer>
      </Styled.Container>
    </Styled.Wrapper>
  );
};

export default FreeStudent;