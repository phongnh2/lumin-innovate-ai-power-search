import classNames from 'classnames';
import { Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import styles from './TryTeamSection.module.scss';

type TryTeamSectionProps = {
  onCreateTeamClick(): void;
  disabled: boolean;
};

const TryTeamSection = ({ disabled, onCreateTeamClick }: TryTeamSectionProps) => {
  const { t } = useTranslation();
  const { onKeyDown } = useKeyboardAccessibility();

  return (
    <div className={classNames(styles.container, { [styles.disabledContainer]: disabled })}>
      <div className={styles.titleWrapper}>
        <Icomoon type="users-md" size="md" color="var(--kiwi-colors-surface-on-surface)" />
        <Text type="headline" size="xs" color="var(--kiwi-colors-surface-on-surface)">
          {t('sidebar.tryToCreateTeam')}
        </Text>
      </div>
      <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
        <Trans
          i18nKey="sidebar.invitingToCreateTeam"
          components={{
            b: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label
              <b
                role="button"
                tabIndex={0}
                className={styles.linkButton}
                onClick={onCreateTeamClick}
                onKeyDown={onKeyDown}
              />
            ),
          }}
        />
      </Text>
    </div>
  );
};

export default TryTeamSection;
