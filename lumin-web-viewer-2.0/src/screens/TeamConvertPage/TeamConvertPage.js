import PropTypes from 'prop-types';
import React from 'react';

import TeamConvertImage from 'assets/images/team-convert.svg';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { LayoutSecondary } from 'lumin-components/Layout';

import withRouter from 'HOC/withRouter';

import { useTranslation } from 'hooks';

import { ORG_TEXT } from 'constants/organizationConstants';

import * as Styled from './TeamConvertPage.styled';

const TeamConvertPage = ({ navigate }) => {
  const { t } = useTranslation();

  return (
    <LayoutSecondary footer={false} staticPage>
      <Styled.Wrapper>
        <Styled.Image src={TeamConvertImage} />
        <Styled.Title>{t('teamConvert.title')}</Styled.Title>
        <Styled.Description>{t('teamConvert.description')}</Styled.Description>
        <Styled.MainButton
          size={ButtonSize.XL}
          color={ButtonColor.PRIMARY_RED}
          onClick={() => navigate(`/${ORG_TEXT}s`)}
        >
          {t('teamConvert.goToOrg')}
        </Styled.MainButton>
      </Styled.Wrapper>
    </LayoutSecondary>
  );
};

TeamConvertPage.propTypes = {
  navigate: PropTypes.func,
};

TeamConvertPage.defaultProps = {
  navigate: () => {},
};

export default withRouter(TeamConvertPage);
