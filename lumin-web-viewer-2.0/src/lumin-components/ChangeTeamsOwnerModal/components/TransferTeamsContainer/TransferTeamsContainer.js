import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { produce } from 'immer';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import TransferTeamsList from '../TransferTeamsList';
import * as Styled from './TransferTeamsContainer.styled';
import TeamMemberPicker from '../TeamMemberPicker';

const propTypes = {
  teamAdmin: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  teamList: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  setTeamList: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};
const defaultProps = {
  teamList: [],
};

const SLIDE = {
  TEAM_LIST: 'team-list',
  TEAM_MEMBER: 'team-member',
};

function TransferTeamsContainer({
  teamAdmin,
  loading,
  teamList,
  onSubmit,
  onClose,
  setTeamList,
  setError,
}) {
  const lastHeight = useRef(null);
  const teamListRef = useRef(null);
  const teamMemberRef = useRef(null);
  const isMounted = useRef(false);
  const [height, setHeight] = useState(0);
  const [selectedTeamId, setSelectedTeam] = useState(null);

  const selectedTeam = useMemo(() => selectedTeamId && teamList.find((team) => team._id === selectedTeamId), [teamList, selectedTeamId]);

  const onTeamClick = (teamId) => {
    setError(false);
    setSelectedTeam(teamId);
  };

  const onSelectMember = (teamId, { _id, email }) => {
    const list = produce(teamList, ((draftState) => {
      const team = draftState.find((_team) => _team._id === teamId);
      if (team) {
        team.newAdmin = {
          _id,
          email,
        };
      }
    }));

    setSelectedTeam(null);
    setTeamList(list);
  };

  const updateHeight = (value) => {
    lastHeight.current = height;
    setHeight(value);
  };

  const onSlideChange = (el) => {
    const isTeamListActive = el.classList.contains(`${SLIDE.TEAM_LIST}-enter-active`);
    const isTeamMemberActive = el.classList.contains(`${SLIDE.TEAM_MEMBER}-enter-active`);
    const isTeamMemberDone = el.classList.contains(`${SLIDE.TEAM_MEMBER}-enter-done`);

    if (isTeamListActive || isTeamMemberActive || isTeamMemberDone) {
      updateHeight(el.offsetHeight);
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
      setTeamList(teamList);
      isMounted.current = true;
    } else {
      updateHeight(teamListRef.current.offsetHeight);
    }
  }, [teamList]);

  useEffect(() => {
    updateHeight(teamListRef.current.offsetHeight);
  }, [teamList.length]);

  const teamMemberTab = Boolean(selectedTeamId);

  return (
    <Styled.Container
      style={{ height }}
      canTransition={Boolean(lastHeight.current)}
    >
      <CSSTransition
        in={!teamMemberTab}
        timeout={500}
        unmountOnExit
        classNames={SLIDE.TEAM_LIST}
        onEntering={onSlideChange}
      >
        <Styled.TeamListSlide className={SLIDE.TEAM_LIST} ref={teamListRef}>
          <TransferTeamsList
            loading={loading}
            teamList={teamList}
            onSubmit={onSubmit}
            onTeamClick={onTeamClick}
            onClose={onClose}
          />
        </Styled.TeamListSlide>
      </CSSTransition>
      <CSSTransition
        in={teamMemberTab}
        timeout={500}
        unmountOnExit
        classNames={SLIDE.TEAM_MEMBER}
        onEntering={onSlideChange}
      >
        <Styled.TeamMemberSlide className={SLIDE.TEAM_MEMBER} ref={teamMemberRef}>
          <TeamMemberPicker
            teamAdmin={teamAdmin}
            team={selectedTeam || {}}
            onSelect={onSelectMember}
            onClose={() => setSelectedTeam(null)}
            onFetched={() => onSlideChange(teamMemberRef.current)}
          />
        </Styled.TeamMemberSlide>
      </CSSTransition>
    </Styled.Container>
  );
}

TransferTeamsContainer.propTypes = propTypes;
TransferTeamsContainer.defaultProps = defaultProps;

export default TransferTeamsContainer;
