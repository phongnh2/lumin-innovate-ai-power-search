import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import { withStyles } from '@mui/styles';
import Fuse from 'fuse.js';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import React, {
  useEffect, useMemo, useState,
} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { unstable_batchedUpdates } from 'react-dom';

import CircularLoading from 'lumin-components/CircularLoading';
import MaterialAvatar from 'lumin-components/MaterialAvatar';
import ButtonIcon from 'lumin-components/Shared/ButtonIcon';
import Radio from 'lumin-components/Shared/Radio';
import Input from 'luminComponents/Shared/Input';

import { useTabletMatch } from 'hooks';

import teamServices from 'services/teamServices';

import avatarUtils from 'utils/avatar';

import { Colors } from 'constants/styles';

import * as Styled from './TeamMemberPicker.styled';

const StyledFormControlLabel = withStyles({
  root: {
    margin: 0,
    display: 'flex',
    width: '100%',
    padding: '0 8px',
    borderRadius: '8px',
    transition: 'all 0.25s ease',
    overflow: 'hidden',
    boxSizing: 'border-box',
    '&:hover': {
      background: Colors.NEUTRAL_10,
    },
  },
  label: {
    overflow: 'hidden',
    flex: 1,
  },
})(FormControlLabel);

const propTypes = {
  teamAdmin: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onFetched: PropTypes.func.isRequired,
};
const defaultProps = {
};

const fuseOption = {
  keys: ['name', 'email'],
};

function TeamMemberPicker({
  teamAdmin,
  team,
  onSelect,
  onClose,
  onFetched,
}) {
  const {
    _id: teamId,
    name,
    avatarRemoteId,
    newAdmin = {},
  } = team;
  const isTabletMatch = useTabletMatch();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const filteredMembers = useMemo(() => {
    const list = members;
    if (!newAdmin.email) {
      return list;
    }
    const selectedIndex = list.findIndex((item) => item.email === newAdmin.email);
    if (selectedIndex !== -1) {
      const admin = list.splice(selectedIndex, 1);
      return [...admin, ...list];
    }
    return list;
  }, [members, newAdmin.email]);
  const fuse = useMemo(() => new Fuse(filteredMembers, fuseOption), [filteredMembers]);
  const filterResults = searchText ? fuse.search(searchText).map((result) => result.item) : filteredMembers;

  const getMembers = async () => {
    try {
      // call api to get members
      const data = await teamServices.getMembersOfTeam(teamId);
      const list = data.filter(({ user }) => user._id !== teamAdmin._id).map(({ user }) => user);
      unstable_batchedUpdates(() => {
        setMembers(list);
        setLoading(false);
      });
    } catch (e) {
      setLoading(false);
    }
  };

  const onMemberSelected = (e) => {
    const userEmail = e.target.value;
    const { _id } = find(members, { email: userEmail });
    onSelect(teamId, { _id, email: userEmail });
  };

  const renderMember = ({
    _id: userId, name: memberName, email: memberEmail, avatarRemoteId: memberAvatarId,
  }) => (
    <StyledFormControlLabel
      value={memberEmail}
      control={<Radio size={20} />}
      label={
        <Styled.UserItem
          key={userId}
        >
          <MaterialAvatar
            src={avatarUtils.getAvatar(memberAvatarId)}
            size={isTabletMatch ? 32 : 28}
            hasBorder
            secondary
          >
            {avatarUtils.getTextAvatar(memberName)}
          </MaterialAvatar>
          <Styled.UserContent>
            <Styled.UserName>{memberName}</Styled.UserName>
            <Styled.UserEmail>{memberEmail}</Styled.UserEmail>
          </Styled.UserContent>
        </Styled.UserItem>
    }
    />

  );

  const renderListMember = () => {
    if (loading) {
      return (
        <Styled.LoadingContainer>
          <CircularLoading size={28} />
        </Styled.LoadingContainer>
      );
    }
    if (!filterResults.length) {
      return <Styled.NoResult>No results found</Styled.NoResult>;
    }

    return (
      <Scrollbars
        autoHeight
        autoHeightMax={230}
        autoHide
      >
        <RadioGroup onChange={onMemberSelected} value={newAdmin.email}>
          {filterResults.map(renderMember)}
        </RadioGroup>
      </Scrollbars>
    );
  };

  useEffect(() => {
    if (teamId) {
      getMembers();
    }
  }, [teamId]);

  useEffect(() => {
    onFetched();
  }, [filterResults]);

  return (
    <div>
      <Styled.Header>
        <ButtonIcon
          size={24}
          icon="arrow-left-alt"
          onClick={onClose}
        />
        <Styled.TeamAvatar>
          <MaterialAvatar
            size={32}
            src={avatarUtils.getAvatar(avatarRemoteId)}
            hasBorder
            team
          />
        </Styled.TeamAvatar>
        <Styled.TeamName>{name}</Styled.TeamName>
      </Styled.Header>
      <Styled.SearchWrapper>
        <Input
          autoFocus
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          showClearButton
          placeholder="Search member to transfer"
          icon="search"
        />
      </Styled.SearchWrapper>

      {renderListMember()}
    </div>
  );
}

TeamMemberPicker.propTypes = propTypes;
TeamMemberPicker.defaultProps = defaultProps;

export default TeamMemberPicker;
