import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import UserEventConstants from 'constants/eventConstants';

const useStyles = makeStyles({
  ActivityIcon: (props) => ({
    backgroundColor: props.backgroundColor,
    width: props.size,
    height: props.size,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: props.size / 2,
  }),
});

function ActivityIcon(props) {
  const { eventName, className, size } = props;
  const { icon, backgroundColor } = UserEventConstants.EventIconMapping[eventName] || {};
  const classes = useStyles({ backgroundColor, size });
  return (
    <div className={`${classes.ActivityIcon} ${className}`}>
      <Icomoon className={icon} size={size / 2} color="#fff" />
    </div>
  );
}

ActivityIcon.propTypes = {
  eventName: PropTypes.string.isRequired,
  className: PropTypes.string,
  size: PropTypes.number,
};

ActivityIcon.defaultProps = {
  size: 20,
  className: '',
};

export default ActivityIcon;
