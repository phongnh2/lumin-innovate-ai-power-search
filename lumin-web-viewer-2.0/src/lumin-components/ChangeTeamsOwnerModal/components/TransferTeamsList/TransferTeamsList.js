import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Scrollbars from 'react-custom-scrollbars-2';

import ModalFooter from 'lumin-components/ModalFooter';

import TransferTeamsItem from '../TransferTeamsItem';
import * as Styled from './TransferTeamsList.styled';
import { VerticalThumb } from '../TransferTeamsContainer/TransferTeamsContainer.styled';

const propTypes = {
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onTeamClick: PropTypes.func.isRequired,
  teamList: PropTypes.array.isRequired,
};

function TransferTeamsList({
  loading,
  onSubmit,
  teamList,
  onTeamClick,
  onClose,
}) {
  const isDisabled = useMemo(() => teamList.some((team) => !team.newAdmin.email), [teamList]);
  return (
    <Styled.Container>
      <Styled.ScrollbarContainer>
        <Scrollbars
          autoHeight
          autoHeightMax={250}
          renderThumbVertical={(props) => <VerticalThumb {...props} />}
        >
          <Styled.ScrollbarWrapper>
            {teamList.map(({
              _id, name, avatarRemoteId, totalMembers, newAdmin,
            }) => (
              <Styled.Item key={_id}>
                <TransferTeamsItem
                  _id={_id}
                  name={name}
                  avatarRemoteId={avatarRemoteId}
                  newAdmin={newAdmin}
                  totalMembers={totalMembers}
                  onClick={onTeamClick}
                />
              </Styled.Item>
            ))}
          </Styled.ScrollbarWrapper>
        </Scrollbars>
      </Styled.ScrollbarContainer>
      <Styled.Divider />
      <ModalFooter
        onSubmit={onSubmit}
        onCancel={onClose}
        loading={loading}
        disabled={isDisabled}
        label="Transfer"
      />
    </Styled.Container>
  );
}

TransferTeamsList.propTypes = propTypes;

export default TransferTeamsList;
