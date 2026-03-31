/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import React from 'react';

import Logo from 'luminComponents/Logo';

import withRouter from 'HOC/withRouter';
import './ViewerInternalTestNavbar.scss';

const ViewerInteralTestNavbar = (props) => {
  const { navigate } = props;
  const handleClick = () => {
    navigate('/documents');
  };
  return (
    <div className="internal__navbar-container">
      <div onClick={handleClick}>
        <Logo />
      </div>
    </div>
  );
};

const propTypes = {
  navigate: PropTypes.func.isRequired,
};

ViewerInteralTestNavbar.propTypes = propTypes;
export default withRouter(ViewerInteralTestNavbar);
