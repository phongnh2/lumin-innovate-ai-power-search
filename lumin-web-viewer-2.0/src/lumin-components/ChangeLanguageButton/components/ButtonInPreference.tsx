import React from 'react';

import LanguagesIcon from 'assets/lumin-svgs/languages.svg';

import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks';

import { Colors } from 'constants/styles';

import ChangeLanguageButton from '../ChangeLanguageButton';
import * as Styled from '../ChangeLanguageButton.styled';

type ChangeLanguageButtonProps = {
  selectedItem: {
    text: string;
  };
};

const ButtonInPreference = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Styled.Wrapper>
      <Styled.Label>{t('common.language')}</Styled.Label>
      <ChangeLanguageButton>
        {({ selectedItem }: ChangeLanguageButtonProps) => (
          <>
            <Styled.TextWrapper>
              <Styled.Image src={LanguagesIcon} alt={selectedItem.text} />
              <Styled.SelectText>{selectedItem.text}</Styled.SelectText>
            </Styled.TextWrapper>
            <Icomoon className="dropdown" color={Colors.NEUTRAL_60} size={12} />
          </>
        )}
      </ChangeLanguageButton>
    </Styled.Wrapper>
  );
};

export default ButtonInPreference;
