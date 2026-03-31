import classNames from 'classnames';
import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

import { usePersonalWorkspaceLocation, useTranslation } from 'hooks';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { useEnableAITool } from 'features/AgreementGen/hooks';

import { AWS_EVENTS } from 'constants/awsEvents';

import styles from '../../MainSidebar.module.scss';

type Props = {
  orgLink?: string;
};

const AGREEMENT_GEN_PATH = ['generate/documents', 'generate/templates'];

const AgreementGenNavItem = ({ orgLink }: Props) => {
  const { '*': otherParams } = useParams();
  const { t } = useTranslation();
  const { enabled: enabledAITool } = useEnableAITool();

  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();

  const link = orgLink ? `${orgLink}/generate/documents/personal` : '/generate/documents/personal';

  const isActive = AGREEMENT_GEN_PATH.some((path) => otherParams?.includes(path));

  if (!enabledAITool) {
    return null;
  }

  return (
    !isAtPersonalWorkspace && (
      <NavLink tabIndex={-1} to={link}>
        <div
          data-active={isActive}
          className={classNames(styles.navigationContainer, isActive ? styles.activeEdit : undefined)}
        >
          <div className={styles.iconButtonContainer}>
            <IconButton
              icon="lm-agreement-gen"
              size="lg"
              activated={isActive}
              activatedProps={{ bg: 'var(--kiwi-colors-custom-brand-sign-sign-surface-container-low)' }}
              data-cy="navigation_agreement_gen"
              data-lumin-btn-name={NavigationNames.AGREEMENT_GEN}
              data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
            />
          </div>
          <Text size="sm" type="label">
            {t('common.generate')}
          </Text>
        </div>
      </NavLink>
    )
  );
};

export default AgreementGenNavItem;
