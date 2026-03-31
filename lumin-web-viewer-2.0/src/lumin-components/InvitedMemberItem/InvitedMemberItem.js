import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React from 'react';

import SvgElement from 'luminComponents/SvgElement';

import './InvitedMemberItem.scss';

const InvitedMemberItem = ({
  email,
  rightElement,
  moreRightElement,

}) => {
  const leftSpacing = () => {
    if (rightElement) {
      return moreRightElement ? 7 : 8;
    }
    return 12;
  };

  return (
    <div className="InvitedMemberItem">
      <Grid container alignItems="center">
        <Grid item xs={leftSpacing()}>
          <div className="InvitedMemberItem__row">
            <SvgElement content="invited-user" alt="Invited user" className="InvitedMemberItem__avatar" width={32} height={32} />
            <div className="InvitedMemberItem__row__text">
              <p className="InvitedMemberItem__text">
                Pending user
              </p>
              <p className="InvitedMemberItem__text InvitedMemberItem__text--secondary">
                {email}
              </p>
            </div>
          </div>
        </Grid>
        {rightElement && (
          <Grid item xs={moreRightElement ? 5 : 4}>
            {rightElement}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

InvitedMemberItem.propTypes = {
  email: PropTypes.string.isRequired,
  rightElement: PropTypes.node,
  moreRightElement: PropTypes.bool,

};

InvitedMemberItem.defaultProps = {
  rightElement: null,
  moreRightElement: false,

};

export default InvitedMemberItem;
