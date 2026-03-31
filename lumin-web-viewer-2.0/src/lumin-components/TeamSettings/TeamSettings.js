import React from 'react';
import PropTypes from 'prop-types';
import {
  EditTeamProfile,
  // TeamTemplateSetting,
  DeleteTeamSetting,
} from './components';

function TeamSettings({ currentTeam, updateTeam }) {
  return (
    <div>
      <EditTeamProfile team={currentTeam} updateTeam={updateTeam} />
      {/* FIXME */}
      {/* <TeamTemplateSetting team={currentTeam} updateTeam={updateTeam} /> */}
      <DeleteTeamSetting team={currentTeam} />
    </div>
  );
}

TeamSettings.propTypes = {
  currentTeam: PropTypes.object.isRequired,
  updateTeam: PropTypes.func.isRequired,
};

export default TeamSettings;
