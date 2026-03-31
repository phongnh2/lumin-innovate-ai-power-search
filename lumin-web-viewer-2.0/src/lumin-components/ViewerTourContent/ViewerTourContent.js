/* eslint-disable jsx-a11y/no-static-element-interactions */
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import './ViewerTourContent.scss';

const propTypes = {
  headerTitle: PropTypes.string,
  content: PropTypes.any,
  hyperLink: PropTypes.string,
  onClickHyperLink: PropTypes.func,
  isLastStep: PropTypes.bool,
  setRun: PropTypes.func,
};

const defaultProps = {
  headerTitle: '',
  content: '',
  hyperLink: '',
  onClickHyperLink: () => {},
  isLastStep: false,
  setRun: () => {},
};

function ViewerTourContent({
  headerTitle, content, hyperLink, onClickHyperLink, isLastStep, setRun,
}) {
  return (
    <div className="ViewerTourContent-container">
      <div className="ViewerTourContent-header">
        <span>{headerTitle}</span>
        {isLastStep && (
          <Button className="close-btn" onClick={() => { setRun(false); }}>
            <Icomoon className="cross icon__12" size={12} />
          </Button>
        )}
      </div>
      <div className="ViewerTourContent-content">
        {content}{' '}
        <span className="link" onClick={onClickHyperLink}>{hyperLink}</span>
      </div>
    </div>
  );
}

ViewerTourContent.propTypes = propTypes;
ViewerTourContent.defaultProps = defaultProps;

export default ViewerTourContent;
