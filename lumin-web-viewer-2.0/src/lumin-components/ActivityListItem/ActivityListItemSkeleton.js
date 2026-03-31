import { Grid } from '@mui/material';
import React from 'react';

import Skeleton from 'luminComponents/Shared/Skeleton';
import './ActivityListItem.scss';

function ActivityListItemSkeleton() {
  return (
    <div className="ActivityItem__container">
      <div className="ActivityItem__AvatarContainer">
        <Skeleton variant="circular" width={40} height={40} />
        <div />
      </div>
      <Grid container spacing={1} direction="row" alignItems="center" className="ActivityItem__ContentContainer">
        <Grid item xs={12} sm={8}>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <div className="ActivityItem__SkeletonDate">
            <Skeleton variant="text" width={100} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default ActivityListItemSkeleton;
