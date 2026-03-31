import { Skeleton as KiwiSkeleton, Switch as KiwiSwitch, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { SubscriptionBadge } from 'screens/OrganizationDashboard/components/SubscriptionBadge';

import Skeleton from 'luminComponents/Shared/Skeleton';
import Switch from 'luminComponents/Shared/Switch';
import Tooltip from 'luminComponents/Shared/Tooltip';

import { useEnableWebReskin } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import './QuestionPanel.scss';
import styles from './QuestionPanel.module.scss';

const defaultProps = {
  section: {},
  updateData: () => {},
  loading: false,
};
const propTypes = {
  section: PropTypes.object,
  updateData: PropTypes.func,
  loading: PropTypes.bool,
};

const QuestionPanel = ({ section, updateData, loading }) => {
  const { isEnableReskin } = useEnableWebReskin();

  const handleOnChangeSwitch = (newValue, newUpdateField) => {
    updateData({ ...newUpdateField, value: newValue });
  };

  const renderButtonByType = (question, permission) => {
    const { field, disabled } = question;
    if (isEnableReskin) {
      return (
        <PlainTooltip offset={12} content={!permission.isAllow && permission.disallowedReason}>
          <div>
            <KiwiSwitch
              checked={field.value}
              onChange={(e) => handleOnChangeSwitch(e.target.checked, field)}
              value={String(field.value)}
              disabled={disabled}
            />
          </div>
        </PlainTooltip>
      );
    }
    return (
      <Tooltip title={!permission.isAllow && permission.disallowedReason}>
        <div>
          <Switch
            checked={field.value}
            onChange={(e) => handleOnChangeSwitch(e.target.checked, field)}
            value={String(field.value)}
            disabled={disabled}
          />
        </div>
      </Tooltip>
    );
  };

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        {section.title && <h3 className={styles.heading}>{section.title}</h3>}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.skeletonWrapper}>
              <KiwiSkeleton width="16%" height={20} radius="sm" />
              <KiwiSkeleton width="40%" height={16} radius="sm" />
            </div>
          ) : (
            section.options.map((option) => (
              <div className={styles.contentContainer} key={option.title}>
                <div className={styles.contentWrapper}>
                  <div>
                    <div className={styles.titleWrapper}>
                      <h4 className={styles.title}>{option.title}</h4>
                      {section.permission.requiredUpgrade && (
                        <SubscriptionBadge elementName={ButtonName.SECURITY_GOOGLE_SIGN_IN} />
                      )}
                    </div>
                    <p className={styles.description}>{option.subtitle}</p>
                  </div>
                  <div className="QuestionPanel__right-wrapper">
                    {renderButtonByType(option.question, section.permission)}
                  </div>
                </div>
                {option.viewButton && option.question.field.value && <div>{option.viewButton}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="QuestionPanel">
      {section.title && <h3 className="QuestionPanel__heading">{section.title}</h3>}
      <div className="QuestionPanel__item">
        {loading ? (
          <div>
            <Skeleton variant="text" width="16%" height={20} />
            <Skeleton variant="text" width="40%" height={20} />
          </div>
        ) : (
          section.options.map((option) => (
            <div className="QuestionPanel__item-wrapper" key={option.title}>
              <div className="QuestionPanel__item-container">
                <div>
                  <div className="QuestionPanel__item-title-wrapper">
                    <h4 className="QuestionPanel__item-title">{option.title}</h4>
                    {section.permission.requiredUpgrade && (
                      <SubscriptionBadge elementName={ButtonName.SECURITY_GOOGLE_SIGN_IN} />
                    )}
                  </div>
                  <p className="QuestionPanel__item-description">{option.subtitle}</p>
                </div>
                <div className="QuestionPanel__right-wrapper">
                  {renderButtonByType(option.question, section.permission)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

QuestionPanel.propTypes = propTypes;
QuestionPanel.defaultProps = defaultProps;

export default QuestionPanel;
