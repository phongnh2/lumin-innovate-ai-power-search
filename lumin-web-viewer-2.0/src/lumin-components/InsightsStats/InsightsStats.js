import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Icomoon from 'luminComponents/Icomoon';
import Skeleton from 'luminComponents/Shared/Skeleton';

import { useTranslation } from 'hooks';

import { commonUtils } from 'utils';
import unitUtils from 'utils/unitUtils';

import { Colors } from 'constants/styles';
import './InsightsStats.scss';

function InsightsStats(props) {
  const {
    value,
    rating,
    isIncrease,
    loading,
    title,
    subtitleShown,
    isDocument,
  } = props;
  const { t } = useTranslation();

  const valueText = useMemo(() => {
    try {
      return unitUtils.getValueWithUnit(value);
    } catch (error) {
      return value;
    }
  }, [value]);

  const iconName = isIncrease ? 'increase' : 'decrease';
  const iconColor = isIncrease ? Colors.SUCCESS_50 : Colors.SECONDARY_50;

  if (loading) {
    return (
      <div className="InsightsStats__container">
        <span className="InsightsStats__value">
          <Skeleton variant="rectangular" width={45} height={30} />
        </span>
        <span className="InsightsStats__title">
          <Skeleton variant="text" width={80} />
        </span>
        {subtitleShown && (
          <div className="InsightsStats__subtitle">
            <Skeleton variant="text" width={120} />
          </div>
        )}
      </div>
    );
  }
  const percent = rating * 100;
  const roundedPercent = Number.isInteger(percent) ? percent : Number(percent).toFixed(1);

  return (
    <div className="InsightsStats__container">
      <span className={classNames('InsightsStats__value', {
        'InsightsStats__value--document': isDocument,
      })}
      >
        {valueText}
      </span>
      <span className={classNames('InsightsStats__title', {
        'InsightsStats__title--document': isDocument,
      })}
      >
        {commonUtils.formatTitleCaseByLocale(title)}
      </span>
      {subtitleShown && (
        <div className={classNames('InsightsStats__subtitle', {
          'InsightsStats__subtitle--document': isDocument,
        })}
        >
          <span className="InsightStats_IconContainer">
            <Icomoon className={iconName} size={20} color={iconColor} />
          </span>
          {rating >= 0 && (
            <span className={`InsightsStats__percentContainer InsightsStats__percentContainer--${isDocument ? 'document' : ''}`}>
              <span className={`InsightsStats__percent InsightsStats__percent--${isDocument ? 'document' : ''}`}>{`${roundedPercent}%`}</span>
              <span className="InsightsStats__text"> {t('insightPage.overLastMonth')}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

InsightsStats.defaultProps = {
  isIncrease: true,
  value: 0,
  rating: 0,
  loading: true,
  subtitleShown: true,
  isDocument: false,
};

InsightsStats.propTypes = {
  value: PropTypes.number,
  rating: PropTypes.number,
  title: PropTypes.string.isRequired,
  isIncrease: PropTypes.bool,
  loading: PropTypes.bool,
  subtitleShown: PropTypes.bool,
  isDocument: PropTypes.bool,
};

export default InsightsStats;
