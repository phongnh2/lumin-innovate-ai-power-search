import React from 'react';
import PropTypes from 'prop-types';
import './ChartTooltip.scss';

function ChartTooltip(props) {
  const { children } = props;
  return (
    <div className="ChartTooltip__Container">
      {children}
    </div>
  );
}

ChartTooltip.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ChartTooltip;
