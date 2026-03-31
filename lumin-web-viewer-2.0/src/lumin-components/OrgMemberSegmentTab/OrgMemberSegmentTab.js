import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tooltip from 'luminComponents/Shared/Tooltip';
import './OrgMemberSegmentTab.scss';

const OrgMemberSegmentTab = ({
  amount, text, toolTips, isActived, onClick,
}) => {
  const getClassNameWithActiveState = useCallback((className) => classNames(className, {
    [`${className}--active`]: isActived,
  }), [isActived]);

  return (
    <Tooltip title={toolTips} enterDelay={300} leaveDelay={0} TransitionProps={{ timeout: 300 }}>
      <div className={getClassNameWithActiveState('OrgMemberSegmentTab__container')} onClick={onClick}>
        <h2 className={getClassNameWithActiveState('OrgMemberSegmentTab__text')}>{text}
        </h2>
        <h3 className={getClassNameWithActiveState('OrgMemberSegmentTab__amount')}>{amount}</h3>
      </div>
    </Tooltip>
  );
};

OrgMemberSegmentTab.propTypes = {
  amount: PropTypes.number,
  text: PropTypes.string,
  toolTips: PropTypes.string,
  isActived: PropTypes.bool,
  onClick: PropTypes.func,
};

OrgMemberSegmentTab.defaultProps = {
  amount: 0,
  text: '',
  toolTips: '',
  isActived: false,
  onClick: () => {},
};

export default OrgMemberSegmentTab;
