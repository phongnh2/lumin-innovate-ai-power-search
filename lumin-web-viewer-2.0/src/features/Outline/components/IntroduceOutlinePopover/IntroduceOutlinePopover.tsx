import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import Popper from '@new-ui/general-components/Popper';
import { PopperProps } from '@new-ui/general-components/Popper/Popper';

import { useTranslation } from 'hooks/useTranslation';

import { useIntroducePopoverHandler } from '../OutlineModal/useIntroducePopoverHandler';

import styles from './IntroduceOutlinePopover.module.scss';

type IntroduceOutlinePopoverProps = Omit<PopperProps, 'children' | 'open'>;

const IntroduceOutlinePopover = (props: IntroduceOutlinePopoverProps) => {
  const { ...otherProps } = props;
  const { open, close } = useIntroducePopoverHandler();
  const { t } = useTranslation();

  return (
    <Popper
      open={open}
      onClose={close}
      placement="right"
      paperProps={{
        style: {
          maxWidth: 360,
          padding: 'var(--kiwi-spacing-2)',
        },
      }}
      hasArrow
      {...otherProps}
    >
      <div>
        <h2 className={styles.title}>{t('introduce.outlinePopover.title')}</h2>
        <p className={styles.description}>
          <Trans
            i18nKey="introduce.outlinePopover.description"
            components={{
              a: (
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                <a
                  aria-label="Learn more"
                  href="https://help.luminpdf.com/create-and-view-document-outline"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </p>
        <div className={styles.footer}>
          <Button variant="filled" onClick={close}>
            {t('common.gotIt')}
          </Button>
        </div>
      </div>
    </Popper>
  );
};

export default IntroduceOutlinePopover;
