import { Chip as KiwiChip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import Chip from 'luminComponents/Shared/Chip';
import { ChipSize } from 'luminComponents/Shared/Chip/types';

import { PLAN_CHIP_COLORS, PLAN_TYPE_LABEL, Plans } from 'constants/plan';
import { Colors } from 'constants/styles';

const propTypes = {
  paymentType: PropTypes.oneOf(Object.keys(Plans)).isRequired,
  hideIcon: PropTypes.bool,
  trialing: PropTypes.bool,
  size: PropTypes.oneOf(Object.values(ChipSize)),
  useReskinChip: PropTypes.bool,
};
const defaultProps = {
  hideIcon: false,
  trialing: false,
  size: ChipSize.SM,
  useReskinChip: false,
};

const PLAN_LABEL = {
  [Plans.FREE]: {
    backgroundColor: Colors.OTHER_13,
    icon: {
      name: 'unlock',
      color: Colors.OTHER_16,
    },
    label: 'FREE',
  },
  // personal
  [Plans.PROFESSIONAL]: {
    backgroundColor: Colors.SECONDARY_10,
    icon: {
      name: 'thunder',
      color: Colors.SECONDARY_50,
    },
    label: 'PROFESSIONAL',
  },
  [Plans.PERSONAL]: {
    backgroundColor: Colors.OTHER_17,
    icon: {
      name: 'user',
      color: Colors.OTHER_18,
    },
    label: 'PERSONAL',
  },
  // org plans
  [Plans.BUSINESS]: {
    backgroundColor: Colors.OTHER_14,
    icon: {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      name: 'un-favorite',
      color: Colors.OTHER_19,
    },
    label: 'BUSINESS',
  },
  [Plans.ORG_STARTER]: {
    backgroundColor: Colors.WARNING_10,
    icon: {
      name: 'business',
      color: Colors.WARNING_60,
    },
    label: 'STARTER',
  },
  [Plans.ORG_PRO]: {
    backgroundColor: Colors.OTHER_15,
    icon: {
      name: 'medal',
      color: Colors.OTHER_20,
    },
    label: 'PRO',
  },
  [Plans.ORG_BUSINESS]: {
    backgroundColor: Colors.PRIMARY_20,
    icon: {
      name: 'un-favorite',
      color: Colors.PRIMARY_90,
    },
    label: 'BUSINESS',
  },
  [Plans.ENTERPRISE]: {
    backgroundColor: Colors.SUCCESS_10,
    icon: {
      name: 'crown',
      color: Colors.SUCCESS_60,
    },
    label: 'ENTERPRISE',
  },
};

function LuminPlanLabel({ paymentType, hideIcon, trialing, size, useReskinChip }) {
  const planData = PLAN_LABEL[paymentType];
  const { label, icon, backgroundColor } = planData;

  const getLabel = () => [label, trialing && 'TRIAL'].filter(Boolean).join(' ');

  const getIconSize = () =>
    ({
      [ChipSize.SM]: 12,
      [ChipSize.MD]: 14,
    }[size]);

  const renderIcon = () => {
    if (hideIcon) {
      return null;
    }
    return (
      <span>
        <Icomoon style={{ marginRight: '0 !important' }} className={icon.name} color={icon.color} size={getIconSize()} />
      </span>
    );
  };

  if (useReskinChip) {
    const planLabel = [PLAN_TYPE_LABEL[paymentType], trialing && 'TRIAL'].filter(Boolean).join(' ').toUpperCase();
    return (
      <KiwiChip
        label={planLabel}
        size="sm"
        style={{
          ...PLAN_CHIP_COLORS[paymentType],
          minWidth: 'fit-content',
        }}
      />
    );
  }

  return (
    <Chip
      size={size}
      label={getLabel()}
      icon={renderIcon()}
      color={Colors.NEUTRAL_100}
      backgroundColor={backgroundColor}
    />
  );
}
LuminPlanLabel.propTypes = propTypes;
LuminPlanLabel.defaultProps = defaultProps;

export default LuminPlanLabel;
