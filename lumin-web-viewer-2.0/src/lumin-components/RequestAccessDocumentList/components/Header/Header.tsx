/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Checkbox as KiwiCheckbox, Text, Button, Divider } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import ButtonMaterial, { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';
import { Checkbox } from 'lumin-components/Shared/Checkbox';

import { useEnableWebReskin } from 'hooks';

import ThemeProvider from 'theme-providers';

import * as Styled from './Header.styled';

import styles from './Header.module.scss';

type Props = {
  indeterminate: boolean;
  checked: boolean;
  currentSelect: number;
  total: number;
  onChange: (e: React.ChangeEvent) => void;
  acceptMultiple: () => void;
  rejectMultiple: () => void;
  totalOnView: number;
  isAccepting: boolean;
  isRejecting: boolean;
};

const Header = ({
  indeterminate,
  checked,
  currentSelect,
  total,
  onChange,
  acceptMultiple,
  rejectMultiple,
  totalOnView,
  isAccepting,
  isRejecting,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.checkboxWrapper}>
            <KiwiCheckbox
              borderColor="var(--kiwi-colors-surface-outline)"
              indeterminate={indeterminate}
              checked={checked}
              onChange={onChange}
              data-cy="select_all_checkbox"
            />
            {checked || indeterminate ? (
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                {t('common.textSelected', { totalSelectDoc: currentSelect, totalDoc: totalOnView })}
              </Text>
            ) : (
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
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
            )}
          </div>
          {(checked || indeterminate) && (
            <div className={styles.actionGroup}>
              <Button
                colorType="system"
                variant="outlined"
                size="md"
                onClick={rejectMultiple}
                loading={isRejecting}
                disabled={isAccepting}
                data-cy="reject_multiple_button"
              >
                {t('common.reject')}
              </Button>
              <Button
                colorType="system"
                variant="outlined"
                size="md"
                onClick={acceptMultiple}
                loading={isAccepting}
                disabled={isRejecting}
                data-cy="accept_multiple_button"
              >
                {t('common.accept')}
              </Button>
            </div>
          )}
        </div>
        <Divider
          size={1}
          color="var(--kiwi-colors-surface-outline-variant)"
          orientation="horizontal"
          className={styles.divider}
        />
      </div>
    );
  }

  return (
    <ThemeProvider.RequestAccessList>
      <Styled.Container>
        {/* @ts-ignore */}
        <Checkbox alignLeft indeterminate={indeterminate} checked={checked} onChange={onChange} />
        {checked || indeterminate ? (
          <Styled.TextWrapper>
            <Styled.Text>
              <b>{t('common.textSelected', { totalSelectDoc: currentSelect, totalDoc: totalOnView })}</b>
            </Styled.Text>
            <div>
              {/* @ts-ignore */}
              <ButtonMaterial
                css={css`
                  margin-right: 8px;
                `}
                color={ButtonColor.TERTIARY}
                onClick={rejectMultiple}
                size={ButtonSize.XS}
                loading={isRejecting}
                disabled={isAccepting}
              >
                {t('common.reject')}
              </ButtonMaterial>
              {/* @ts-ignore */}
              <ButtonMaterial
                color={ButtonColor.TERTIARY}
                onClick={acceptMultiple}
                size={ButtonSize.XS}
                loading={isAccepting}
                disabled={isRejecting}
              >
                {t('common.accept')}
              </ButtonMaterial>
            </div>
          </Styled.TextWrapper>
        ) : (
          <Styled.TextWrapper>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
            <Styled.Text>
              <Trans
                i18nKey={
                  total > 1
                    ? 'modalShare.peopleAreWaitingForYourApprovement'
                    : 'modalShare.personIsWaitingForYourApprovement'
                }
                components={{ bold: <b /> }}
                values={{ total }}
              />
            </Styled.Text>
          </Styled.TextWrapper>
        )}
      </Styled.Container>
    </ThemeProvider.RequestAccessList>
  );
};

export default Header;
