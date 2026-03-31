/* eslint-disable sonarjs/no-duplicated-branches */
import { Grid } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import Skeleton from 'luminComponents/Shared/Skeleton';

import { ORGANIZATION_MEMBER_TYPE } from 'constants/organizationConstants';
import './MemberOrgRowSkeleton.scss';

MemberOrgRowSkeleton.propTypes = {
  type: PropTypes.oneOf(Object.values(ORGANIZATION_MEMBER_TYPE)).isRequired,
};

function MemberOrgRowSkeleton({ type }) {
  const renderTextSkeleton = (width = 110, moreClass = '') => <Skeleton className={moreClass} variant="text" width={width} />;
  const renderAvatarSkeleton = (width = 40) => <Skeleton variant="circular" width={width} height={width} />;

  const renderAvatarWithNameAndEmail = () => (
    <Grid item sm={4} xs={11} className="MemberOrgRowSkeleton__nameAvatar">
      {renderAvatarSkeleton()}
      <div className="MemberOrgRowSkeleton__name">
        {renderTextSkeleton()}
        {renderTextSkeleton(140)}
        {renderTextSkeleton(150, 'hide-in-tablet-up')}
      </div>
    </Grid>
  );

  const renderAvatarWithName = () => (
    <Grid item sm={4} xs={11} className="MemberOrgRowSkeleton__nameAvatar">
      {renderAvatarSkeleton()}
      <div className="MemberOrgRowSkeleton__name">
        {renderTextSkeleton()}
        {renderTextSkeleton(160, 'hide-in-tablet-up')}
      </div>
    </Grid>
  );

  const renderContent = () => {
    switch (type) {
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST:
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER:
        return (
          <>
            {renderAvatarWithNameAndEmail()}
            <Grid item sm={3} xs={3}>
              {renderTextSkeleton(90)}
            </Grid>
            <Grid item sm={2} xs={2}>
              {renderTextSkeleton(90)}
            </Grid>
            <Grid item sm={2} xs={2}>
              {renderTextSkeleton(90)}
            </Grid>
          </>
        );
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER:
        return (
          <>
            {renderAvatarWithName()}
            <Grid item sm={3} xs={3} className="hide-in-mobile">
              {renderTextSkeleton(90)}
            </Grid>
          </>
        );
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS:
        return (
          <>
            {renderAvatarWithNameAndEmail()}
            <Grid item sm={3} xs={3} className="hide-in-mobile">
              {renderTextSkeleton(90)}
            </Grid>
            <Grid item sm={3} xs={3} className="hide-in-mobile">
              {renderTextSkeleton(90)}
            </Grid>
          </>
        );
      case ORGANIZATION_MEMBER_TYPE.MEMBER:
        return (
          <>
            {renderAvatarWithNameAndEmail()}
            <Grid item sm={3} xs={3} className="hide-in-mobile">
              {renderTextSkeleton(90)}
            </Grid>
            <Grid item sm={3} xs={3} className="hide-in-mobile">
              {renderTextSkeleton(90)}
            </Grid>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Grid container className="MemberOrgRowSkeleton__container">
      {renderContent()}
    </Grid>
  );
}

export default MemberOrgRowSkeleton;
