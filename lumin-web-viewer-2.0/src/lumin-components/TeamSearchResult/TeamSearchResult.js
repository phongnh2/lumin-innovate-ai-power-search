import React from 'react';
import TeamSearchItem from 'luminComponents/TeamSearchItem'

class TeamSearchResult extends React.PureComponent {
  constructor(props) {
  }

  render() {
    const { currentUser, teams, handleMoveFile, currentDocument, searchText } = this.props;
    const teamsToRender = teams.filter(team => {
      return team.name.includes(searchText);
    })
    return (
      teamsToRender.map(team => {
        const isOwner = team.owner._id === currentUser._id;
        return (
          <TeamSearchItem
            key={team._id}
            handleMoveFile={handleMoveFile}
            currentDocument={currentDocument}
            isOwner={isOwner}
            team={team}
          />
        )
      })
    )
  }
}

export default TeamSearchResult;