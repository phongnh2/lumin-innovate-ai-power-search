import React from 'react';
import PropTypes from 'prop-types';
import { ORGANIZATION_TEXT } from 'constants/organizationConstants';
import * as Styled from '../../ChangeTeamsOwnerModal.styled';

const propTypes = {
  email: PropTypes.string,
  hasError: PropTypes.bool.isRequired,
};
const defaultProps = {
  email: '',
};

function TransferTeamsHeader({
  email,
  hasError,
}) {
  return (
    <Styled.HeaderContainer>
      <Styled.HeaderTitle>Transfer to remove member</Styled.HeaderTitle>
      <Styled.HeaderText>
        You need to transfer the team ownership of{' '}
        <Styled.HeaderBold>{email}</Styled.HeaderBold>{' '}
        before removing him from the {ORGANIZATION_TEXT}.{' '}
        The teams in which this user is the only member will be deleted.
      </Styled.HeaderText>
      {hasError && (
        <Styled.ErrorBlock>
          Something went wrong. Please try again.
        </Styled.ErrorBlock>
      )}
    </Styled.HeaderContainer>
  );
}

TransferTeamsHeader.propTypes = propTypes;
TransferTeamsHeader.defaultProps = defaultProps;

export default TransferTeamsHeader;
