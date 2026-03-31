import { makeStyles } from '@mui/styles';
import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';

const useStyles = makeStyles({
  container: {
    minHeight: 400,
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
});

const InfoModalSkeleton = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={classes.content}
          >
            <Skeleton width="60%" />
            <div>
              <Skeleton />
              <Skeleton width="65%" />
            </div>
          </div>
        ))}
      </div>

      <Skeleton variant="rectangular" height={48} />

    </div>
  );
};

InfoModalSkeleton.propTypes = {

};

export default InfoModalSkeleton;
