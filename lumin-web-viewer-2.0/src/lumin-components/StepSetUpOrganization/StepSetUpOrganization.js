/* eslint-disable import/order */
import React, { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Icomoon as KiwiIcomoon, Text } from 'lumin-ui/kiwi-ui';

import Icomoon from 'lumin-components/Icomoon';

import { useEnableWebReskin, useTranslation } from 'hooks';
import { Colors } from 'constants/styles';
import * as Styled from './StepSetUpOrganization.styled';
import styles from './StepSetUpOrganization.module.scss';

const getSteps = (t) => [
  {
    icon: 'location-org',
    text: t('setUpOrg.setUpOrg'),
  },
  {
    icon: 'add-member',
    text: t('setUpOrg.addCollaborators'),
  },
  {
    icon: 'un-favorite',
    text: t('setUpOrg.finish'),
  },
];

const StepSetUpOrganization = ({ step }) => {
  const { t } = useTranslation();
  const steps = getSteps(t);

  const { isEnableReskin } = useEnableWebReskin();

  const stepsReskin = useMemo(
    () => [
      {
        icon: 'main-circle-md',
        text: t('common.setUp'),
      },
      {
        icon: 'user-plus-md',
        text: t('setUpOrg.addCollaborators'),
      },
      {
        icon: 'star-md',
        text: t('setUpOrg.finish'),
      },
    ],
    []
  );

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        {stepsReskin.map(({ icon, text }, index) => (
          <Fragment key={icon}>
            <div className={styles.stepWrapper}>
              <div className={styles.stepCircle} data-active={index < step}>
                <KiwiIcomoon
                  size="md"
                  type={icon}
                  color={
                    index < step
                      ? 'var(--kiwi-colors-custom-brand-tools-collaboration-surface)'
                      : 'var(--kiwi-colors-surface-on-surface-variant)'
                  }
                />
              </div>
              <Text size="xs" type="label" color="var(--kiwi-colors-surface-on-surface-variant)">
                {text}
              </Text>
            </div>
            {index < 2 && <div className={styles.line} />}
          </Fragment>
        ))}
      </div>
    );
  }

  return (
    <Styled.Container>
      {steps.map((item, index) => {
        const active = index < step;
        const icon = index < step - 1 ? 'check' : item.icon;

        return (
          <Fragment key={index}>
            <Styled.Item>
              <Styled.Icon $active={active}>
                <Icomoon className={icon} size={18} color={active ? Colors.WHITE : Colors.NEUTRAL_80} />
              </Styled.Icon>
              <Styled.Text>{item.text}</Styled.Text>
            </Styled.Item>
            <Styled.Divider $step={step} />
          </Fragment>
        );
      })}
    </Styled.Container>
  );
};

StepSetUpOrganization.propTypes = {
  step: PropTypes.oneOf([1, 2, 3]),
};

StepSetUpOrganization.defaultProps = {
  step: 1,
};

export default StepSetUpOrganization;
