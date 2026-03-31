import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Shared/Tooltip';

import { useTabletMatch } from 'hooks';

import { commonUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { CARD_MODE, DASHBOARD_ACTION } from 'constants/dashboardConstants';
import { Colors } from 'constants/styles';
import { BASEURL } from 'constants/urls';

import './DashboardCard.scss';

function DashboardCard(props) {
  const {
    isComment,
    className,
    iconName,
    iconSize,
    title,
    tooltipContent,
    rightIcon,
    rightText,
    rightLink,
    onRightLinkClick,
    children,
    mode,
    rightElement,
    isPersonalInsight,
    largerTitle,
  } = props;
  const isTabletMatch = useTabletMatch();
  const renderCardLayout = () => {
    const isInviteMembersAction =
      rightLink && new URL(`${BASEURL}${rightLink}`).searchParams.get('action') === DASHBOARD_ACTION.INVITE_MEMBERS;
    const isActiveLink = rightLink !== '' && (rightText !== '' || rightIcon !== '');
    const isActiveClick = typeof onRightLinkClick === 'function' && rightLink === '' && (rightText !== '' || rightIcon !== '');
    const hasHeader = Boolean(iconName && title);
    const iconLinkSize = isTabletMatch ? iconSize : 16;

    const linkProps = isInviteMembersAction ? {
      'data-lumin-btn-name': ButtonName.INVITE_CIRCLE_MEMBER
    } : {};

    return (
      <>
        {hasHeader && (
        <div className={classNames('Dashboard__CardTop', { 'Dashboard__CardTop--comment': isComment })}>
          {isPersonalInsight &&
            <div className="Dashboard__CardTop-Icon">
              <Icomoon className={iconName} size={iconSize} />
            </div>}
          <div style={{ display: 'flex' }}>
            <span className={classNames('Dashboard__CardTop-Title', { 'Dashboard__CardTop-Title--comment': isComment, 'Dashboard__CardTop-Title--larger-title': largerTitle })}>
              {commonUtils.formatTitleCaseByLocale(title)}
            </span>
            {tooltipContent && (
              <Tooltip
                title={tooltipContent}
                tooltipStyle={{ maxWidth: 220 }}
                placement="bottom"
              >
                <Icomoon className="info Dashboard__CardTop-icon" size={18} color={Colors.NEUTRAL_60} />
              </Tooltip>
            )}
          </div>
          {isActiveLink && (
            <Link to={rightLink} className="Dashboard__CardTop-Link" {...linkProps}>
              <Icomoon className={`${rightIcon} Dashboard__CardTop-icon`} size={iconLinkSize} color={Colors.WHITE} />
              {rightText}
            </Link>
          )}
          {isActiveClick && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <span
              onClick={onRightLinkClick}
              className="Dashboard__CardTop-Link"
            >
              <Icomoon className={rightIcon} size={iconLinkSize} color={Colors.WHITE} />
              {rightText}
            </span>
          )}
        </div>
        )}
        <div className="Dashboard__CardBody">
          {children}
        </div>
      </>
    );
  };

  if (mode === CARD_MODE.HORIZONTAL) {
    return (
      <div className={classNames(`Dashboard__Card Dashboard__Card--${isComment ? 'comment' : ''}`, {
        [className]: Boolean(className),
      })}
      >
        <div className="Dashboard__Vertical">
          <div>
            {renderCardLayout()}
          </div>
          <div className="Dashboard__VerticalRight">
            {rightElement}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(`Dashboard__Card Dashboard__Card--${isComment ? 'comment' : ''}`, {
      [className]: Boolean(className),
    })}
    >
      {renderCardLayout()}
    </div>
  );
}

DashboardCard.defaultProps = {
  title: '',
  tooltipContent: '',
  iconName: '',
  iconSize: 20,
  rightText: '',
  rightLink: '',
  className: '',
  rightIcon: '',
  onRightLinkClick: null,
  mode: CARD_MODE.VERTICAL,
  rightElement: null,
  isPersonalInsight: false,
  isComment: false,
  largerTitle: false,
};

DashboardCard.propTypes = {
  iconName: PropTypes.string,
  iconSize: PropTypes.number,
  title: PropTypes.node,
  tooltipContent: PropTypes.node,
  rightText: PropTypes.string,
  rightIcon: PropTypes.string,
  rightLink: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onRightLinkClick: PropTypes.func,
  mode: PropTypes.oneOf(Object.values(CARD_MODE)),
  rightElement: PropTypes.node,
  isPersonalInsight: PropTypes.bool,
  isComment: PropTypes.bool,
  largerTitle: PropTypes.bool,
};

export default DashboardCard;
