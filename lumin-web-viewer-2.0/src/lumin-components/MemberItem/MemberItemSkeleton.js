import { Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React from 'react';

import './MemberItem.scss';

const propTypes = {
  size: PropTypes.oneOf(['medium', 'large']),
  times: PropTypes.number,
  className: PropTypes.string,

};

const defaultProps = {
  size: 'medium',
  times: 2,
  className: '',

};

const MemberItemSkeleton = ({ size, times, className }) => {
  const avatarSize = size === 'medium' ? 32 : 40;
  return Array.from({ length: times }, (_, index) => (
    <div className={`MemberItem ${className}`} key={index}>
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <div className={`MemberItem__rowSkeleton ${size}`}>
            <Skeleton animation="wave" variant="circular" width={avatarSize} height={avatarSize} />
            <div className="MemberItem__rowTextSkeleton">
              <Skeleton animation="wave" height={20} width="45%" />
              <Skeleton animation="wave" height={20} width="40%" />
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  ));
};

MemberItemSkeleton.propTypes = propTypes;
MemberItemSkeleton.defaultProps = defaultProps;

export default MemberItemSkeleton;
