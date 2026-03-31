import { Icomoon as KiwiIcomoon, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import Icomoon from 'lumin-components/Icomoon';

import { useEnableWebReskin } from 'hooks';

import { Colors } from 'constants/styles';

import * as Styled from './FailedFetchError.styled';

import styles from './FailedFetchError.module.scss';

interface IProps {
  retry: () => void;
}

const FailedFetchError = ({ retry }: IProps): JSX.Element => {
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.errorTitle}>
          <KiwiIcomoon size="lg" type="circle-x-filled-lg" color="var(--kiwi-colors-semantic-error)" />
          <Text type="title" size="md" color="var(--kiwi-colors-surface-on-surface)">
            <Trans i18nKey="documentPage.failedFetchError.title" />
          </Text>
        </div>
        <Text type="body" size="md" color="var(--kiwi-colors-custom-role-web-surface-var-subtext)">
          <Trans
            i18nKey="documentPage.failedFetchError.description"
            components={{
              span: <span role="presentation" onClick={retry} className={styles.actionText} />,
            }}
          />
        </Text>
      </div>
    );
  }

  return (
    <Styled.Container>
      <Styled.Title>
        <Icomoon className="cancel-circle" size={18} color={Colors.SECONDARY_50} /> <span>Failed to load</span>{' '}
      </Styled.Title>
      <Styled.Description>
        Please{' '}
        <span role="button" tabIndex={0} onClick={retry}>
          click here
        </span>{' '}
        to retry again.
      </Styled.Description>
    </Styled.Container>
  );
};

export default FailedFetchError;
