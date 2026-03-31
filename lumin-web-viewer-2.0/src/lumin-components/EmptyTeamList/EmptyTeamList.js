import PropTypes from 'prop-types';
import React from 'react';

import TeamsImg from 'assets/images/teams.svg';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks';

import { Colors } from 'constants/lumin-common';

import {
  StyledEmptyImgContainer,
  StyledCreateButton,
  StyledEmptyImg,
  StyledEmptyContainer,
} from './EmptyTeamList.styled';

function EmptyTeamList({ onCreateTeamClick }) {
  const { t } = useTranslation();
  return (
    <StyledEmptyContainer>
      <StyledEmptyImgContainer>
        <StyledEmptyImg
          src={TeamsImg}
          alt="Lumin teams"
        />
      </StyledEmptyImgContainer>
      {
        Boolean(onCreateTeamClick) && (
          <StyledCreateButton
            size={ButtonSize.XL}
            onClick={onCreateTeamClick}
          >
            <Icomoon
              className="plus-thin"
              size={14}
              style={{ marginRight: 12 }}
              color={Colors.WHITE}
            />
            {t('common.createTeam')}
          </StyledCreateButton>
        )
      }
    </StyledEmptyContainer>
  );
}

EmptyTeamList.propTypes = {
  onCreateTeamClick: PropTypes.func,
};
EmptyTeamList.defaultProps = {
  onCreateTeamClick: null,
};

export default EmptyTeamList;
