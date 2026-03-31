/* eslint-disable @typescript-eslint/ban-ts-comment */
import Collapse from '@mui/material/Collapse';
import { IconButton, Text, Icomoon as KiwiIcomoon, Collapse as KiwiCollapse, Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';
import { useToggle } from 'react-use';

import { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';
import Icomoon from 'lumin-components/Icomoon';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { MAX_REQUEST_ACCESS_ITEMS } from 'constants/documentConstants';
import { Colors } from 'constants/styles';

import ThemeProvider from 'theme-providers';

import * as Styled from './RequestAccessSection.styled';

import styles from './RequestAccessSection.module.scss';

type Props = {
  children: ({ openFullList, fullList }: { openFullList: () => void; fullList: boolean }) => JSX.Element;
  total: number;
  openFullList: () => void;
};

const RequestAccessSection = ({ children, total, openFullList }: Props): JSX.Element => {
  const [on, toggle] = useToggle(true);
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const arrowDirection = { transform: `rotate(${on ? 180 : -90}deg)` };

  if (!total) {
    return null;
  }

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <div
          className={styles.collapseHeader}
          role="button"
          tabIndex={0}
          data-expanded={on}
          onClick={toggle}
          data-cy="request_access_section_toggle"
        >
          <div className={styles.collapseLeftSection}>
            <KiwiIcomoon type="users-md" size="md" />
            <Text component="span" type="body" size="md">
              <Trans
                i18nKey={
                  total > 1
                    ? 'modalShare.peopleAreWaitingForYourApprovement'
                    : 'modalShare.personIsWaitingForYourApprovement'
                }
                components={{ bold: <b /> }}
                values={{ total }}
              />
            </Text>
          </div>
          <IconButton
            size="sm"
            icon="caret-down-filled-sm"
            iconColor="var(--kiwi-colors-surface-on-surface)"
            data-expanded={on}
            className={styles.collapseIcon}
          />
        </div>
        <KiwiCollapse in={on} className={styles.collapseWrapper}>
          <div className={styles.collapseBody}>
            {children({ openFullList, fullList: false })}
            {total > MAX_REQUEST_ACCESS_ITEMS && (
              <Button
                colorType="system"
                variant="outlined"
                size="sm"
                className={styles.viewAllBtn}
                onClick={openFullList}
                data-cy="view_all_button"
              >
                {t('common.viewAll')}
              </Button>
            )}
          </div>
        </KiwiCollapse>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <ThemeProvider.RequestAccessList>
      <Styled.Container>
        <Styled.Header onClick={toggle} role="button" tabIndex={0}>
          <Styled.Title>
            {/* @ts-ignore */}
            <Icomoon size={20} className="users" />{' '}
            <span>
              <Trans
                i18nKey={
                  total > 1
                    ? 'modalShare.peopleAreWaitingForYourApprovement'
                    : 'modalShare.personIsWaitingForYourApprovement'
                }
                components={{ bold: <b /> }}
                values={{ total }}
              />
            </span>
          </Styled.Title>
          {/* @ts-ignore */}
          <Icomoon className="dropdown" size={10} style={arrowDirection} />
        </Styled.Header>
        <Collapse in={on}>
          <Styled.Body>
            {children({ openFullList, fullList: false })}
            <Styled.ViewAllContainer>
              {total > MAX_REQUEST_ACCESS_ITEMS && (
                // @ts-ignore
                <Styled.ViewAll
                  onClick={openFullList}
                  color={ButtonColor.HYPERLINK}
                  size={ButtonSize.XXS}
                  labelColor={Colors.PRIMARY_90}
                >
                  {t('common.viewAll')}
                </Styled.ViewAll>
              )}
            </Styled.ViewAllContainer>
          </Styled.Body>
        </Collapse>
      </Styled.Container>
    </ThemeProvider.RequestAccessList>
  );
};

export default RequestAccessSection;
