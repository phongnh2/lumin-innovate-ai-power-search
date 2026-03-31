import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React from 'react';

import CookieWarningContext from 'luminComponents/CookieWarningModal/Context';
import Icomoon from 'luminComponents/Icomoon';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import Tooltip from 'luminComponents/Tooltip';

import { avatar } from 'utils';

import { featureStoragePolicy } from 'features/FeatureConfigs';

import './TeamSearchItem.scss';

const propTypes = {
  currentDocument: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  handleMoveFile: PropTypes.func.isRequired,
  isOwner: PropTypes.bool.isRequired,
};

const defaultProps = {};

class TeamSearchItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShowMoveButton: false,
    };
  }

  handleMoveClick = () => {
    const { currentDocument, team, handleMoveFile } = this.props;
    const { setCookieModalVisible, cookiesDisabled } = this.context;
    if (featureStoragePolicy.externalStorages.includes(currentDocument.service) && cookiesDisabled) {
      setCookieModalVisible(true);
      return;
    }
    handleMoveFile(currentDocument, team);
  };

  render() {
    const { isOwner, team } = this.props;

    const { handleMoveClick } = this;
    const { isShowMoveButton } = this.state;
    return (
      <div
        className="TeamSearchItem"
        onMouseEnter={() => this.setState({ isShowMoveButton: true })}
        onMouseLeave={() => this.setState({ isShowMoveButton: false })}
      >
        <MaterialAvatar containerClasses="image" size={40} src={avatar.getAvatar(team.avatarRemoteId)}>
          {avatar.getTextAvatar(team.name)}
        </MaterialAvatar>
        <span title={team.name} className="TeamSearchItem__teamName">
          {team.name}
        </span>
        {isOwner && (
          <div className="TeamSearchItem__tooltip">
            <Tooltip content={"The team that you're the owner or admin"}>
              <div>
                <Icomoon className="team icon__14 TeamSearchItem__icon" />
              </div>
            </Tooltip>
          </div>
        )}
        {isShowMoveButton && (
          <Button className="TeamSearchItem__button" onClick={handleMoveClick}>
            <span>Move</span>
          </Button>
        )}
      </div>
    );
  }
}

TeamSearchItem.defaultProps = defaultProps;
TeamSearchItem.propTypes = propTypes;
TeamSearchItem.contextType = CookieWarningContext;

export default TeamSearchItem;
