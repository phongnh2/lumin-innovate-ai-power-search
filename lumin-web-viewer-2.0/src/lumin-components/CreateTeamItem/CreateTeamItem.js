import React from 'react';
import PropTypes from 'prop-types';
import Icomoon from 'luminComponents/Icomoon';
import { Colors } from 'constants/styles';
import { useTranslation } from 'hooks';
import { commonUtils } from 'utils';
import {
  StyledCreateTeamContainer,
  StyledCreateTeamTitle,
  StyledCreateTeamIconWrapper,
} from './CreateTeamItem.styled';

const propTypes = {
  onClick: PropTypes.func,
};
const defaultProps = {
  onClick: () => {},
};

function CreateTeamItem({
  onClick,
}) {
  const { t } = useTranslation();

  return (
    <StyledCreateTeamContainer onClick={onClick}>
      <StyledCreateTeamIconWrapper>
        <Icomoon className="plus-thin" size={22} color={Colors.NEUTRAL_100} />
      </StyledCreateTeamIconWrapper>
      <StyledCreateTeamTitle>{commonUtils.formatTitleCaseByLocale(t('teamListPage.createNew'))}</StyledCreateTeamTitle>
    </StyledCreateTeamContainer>
  );
}

CreateTeamItem.propTypes = propTypes;
CreateTeamItem.defaultProps = defaultProps;

export default CreateTeamItem;
