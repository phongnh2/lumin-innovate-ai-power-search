import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import selectors from 'selectors';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import DashboardCard from 'luminComponents/DashboardCard';

import withRouter from 'HOC/withRouter';

import { useTranslation } from 'hooks';

import { multilingualUtils } from 'utils';

import { DASHBOARD_TYPE, CARD_MODE, DASHBOARD_ACTION } from 'constants/dashboardConstants';
import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAMS_TEXT } from 'constants/teamConstant';

import './InsightsPlanCard.scss';

function InsightsPlanCard({
  mode,
  match,
  location,
  type,
  planContent,
  currentOrganization,
  noHeader,
  customImgClassName,
}) {
  const { t } = useTranslation();
  const teamId = match?.params?.teamId || new RegExp(`^/${TEAMS_TEXT}/(\\w+)/\\w+`).exec(location.pathname)?.[1];
  const organization = currentOrganization?.data || {};

  const getButtonLink = () => {
    switch (type) {
      case DASHBOARD_TYPE.TEAM:
        return `/${TEAMS_TEXT}/${teamId}/members?action=${DASHBOARD_ACTION.INVITE_MEMBERS}`;
      case DASHBOARD_TYPE.ORG_TEAM:
        return `/${ORG_TEXT}/${organization?.url}/${TEAMS_TEXT}/${teamId}/members?action=${DASHBOARD_ACTION.INVITE_MEMBERS}`;
      case DASHBOARD_TYPE.ORGANIZATION:
        return `/${ORG_TEXT}/${organization?.url}/members?action=${DASHBOARD_ACTION.INVITE_MEMBERS}`;
      default:
        return null;
    }
  };

  const renderRightElement = () => {
    if (type !== DASHBOARD_TYPE.ORGANIZATION) {
      return null;
    }

    return (
      <div className="InsightsPlanCard__RightEl">
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={planContent.image} />
      </div>
    );
  };

  if (!planContent) {
    return null;
  }

  const btnLink = getButtonLink();
  const cardTitle = !noHeader && multilingualUtils.getPlanDescription({ t, type: planContent.title });
  const cardIcon = !noHeader && 'plans';
  return (
    <DashboardCard
      className="InsightsPlanCard__Container"
      isComment
      largerTitle
      title={cardTitle}
      iconName={cardIcon}
      mode={mode}
      rightElement={renderRightElement()}
    >
      {mode === CARD_MODE.VERTICAL && (
        <div className="InsightsPlanCard__Img-Container">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img className={classNames('InsightsPlanCard__Img', customImgClassName)} src={planContent.image} />
        </div>
      )}
      <span
        className={classNames('InsightsPlanCard__Text', {
          'InsightsPlanCard__Text--left': mode === CARD_MODE.HORIZONTAL,
        })}
      >
        {t(planContent.translationKey)}
      </span>
      {
        planContent.btnText && btnLink && (
          <ButtonMaterial
            className={classNames('InsightsPlanCard__Button', {
              'InsightsPlanCard__Button--organization': type === DASHBOARD_TYPE.ORGANIZATION,
            })}
            data-lumin-btn-name={planContent.buttonName}
            data-lumin-btn-purpose={planContent.buttonPurpose}
            size={ButtonSize.XL}
            component={Link}
            to={btnLink}
            fullWidth
          >
            {t(planContent.btnText)}
          </ButtonMaterial>
        )
      }
    </DashboardCard>
  );
}

InsightsPlanCard.propTypes = {
  mode: PropTypes.string,
  type: PropTypes.string,
  planContent: PropTypes.object,
  currentOrganization: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
  noHeader: PropTypes.bool,
  customImgClassName: PropTypes.string,
};

InsightsPlanCard.defaultProps = {
  mode: CARD_MODE.VERTICAL,
  type: '',
  planContent: null,
  currentOrganization: {},
  location: {},
  match: {},
  noHeader: false,
  customImgClassName: '',
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state),
});

export default connect(mapStateToProps)(withRouter(InsightsPlanCard));
