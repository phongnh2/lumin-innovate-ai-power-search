/* eslint-disable @typescript-eslint/ban-ts-comment */
import classNames from 'classnames';
import { Dialog as KiwiDialog, Text, Icomoon, Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import CoverImage1 from 'assets/images/informative-modal1.png';
import CoverImage2 from 'assets/images/informative-modal2.png';
import IllustrationMagic from 'assets/reskin/images/illustration-magic.png';
import IllustrationPaperPlane from 'assets/reskin/images/illustration-paper-plane.png';

import Dialog from 'lumin-components/Dialog';
import ButtonMaterial, { ButtonSize } from 'luminComponents/ButtonMaterial';
import { ButtonColor } from 'luminComponents/ButtonMaterial/types/ButtonColor';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { numberUtils } from 'utils';
import stringUtils from 'utils/string';

import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';
import { ModalSize } from 'constants/styles/Modal';

import * as Styled from './ModalConfirmInformation.styled';

import styles from './ModalConfirmInformation.module.scss';

type Props = {
  userRole: string;
  onConfirm: () => void;
  onCancel: () => void;
  currencySymbol: string;
  creditBalance: string;
};

const ModalConfirmInformation = ({
  userRole,
  onConfirm,
  onCancel,
  currencySymbol,
  creditBalance,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const newTools = [
    t('modalConfirmInformation.content.tool1'),
    t('modalConfirmInformation.content.tool2'),
    t('modalConfirmInformation.content.tool3'),
    t('modalConfirmInformation.content.tool4'),
  ];
  const isAdmin = stringUtils.isIgnoreCaseEqual(userRole, ORGANIZATION_ROLES.ORGANIZATION_ADMIN);

  if (isEnableReskin) {
    return (
      <KiwiDialog opened size="md" centered onClose={onCancel}>
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.coverImage}>
              <img
                src={isAdmin ? IllustrationPaperPlane : IllustrationMagic}
                alt="illustration modal"
                className={classNames({ [styles.admin]: isAdmin })}
              />
            </div>
            <Text component="h3" type="headline" size="lg" className={styles.title}>
              {isAdmin ? t('modalConfirmInformation.titleHeaderForCA') : t('modalConfirmInformation.titleHeaderForBM')}
            </Text>
            <div className={styles.description}>
              <Text type="title" size="sm">
                {isAdmin ? (
                  t('modalConfirmInformation.content.descriptionForCA')
                ) : (
                  <Trans
                    i18nKey="modalConfirmInformation.content.descriptionForBM"
                    components={{ b: <b />, br: <span /> }}
                    values={{
                      currencySymbol,
                      creditBalance: numberUtils.formatTwoDigitsDecimal(creditBalance),
                    }}
                  />
                )}
              </Text>
              <div className={styles.listTools}>
                {newTools.map((tool) => (
                  <div key={tool} className={styles.tool}>
                    <Icomoon type="checkbox-lg" size="lg" color="var(--kiwi-colors-semantic-success)" />
                    <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                      {tool}
                    </Text>
                  </div>
                ))}
              </div>
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                {t('modalConfirmInformation.content.note')}
              </Text>
            </div>
          </div>
          <div className={styles.buttonWrapper}>
            <Button variant="outlined" size="lg" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button size="lg" onClick={onConfirm}>
              {t('modalConfirmInformation.confirmButtonTitle')}
            </Button>
          </div>
        </div>
      </KiwiDialog>
    );
  }

  return (
    // @ts-ignore
    <Dialog open width={ModalSize.LG} noPadding onClose={onCancel}>
      <Styled.Container>
        <Styled.LeftWrapper>
          <Styled.CoverImage src={isAdmin ? CoverImage1 : CoverImage2} alt="banner" />
        </Styled.LeftWrapper>
        <Styled.RightWrapper $hasDivider={isAdmin}>
          {isAdmin && <Styled.Divider />}
          <Styled.Content $hasDivider={isAdmin}>
            <Styled.Title>
              {isAdmin ? t('modalConfirmInformation.titleHeaderForCA') : t('modalConfirmInformation.titleHeaderForBM')}
            </Styled.Title>
            <Styled.Description>
              {isAdmin ? (
                t('modalConfirmInformation.content.descriptionForCA')
              ) : (
                <Trans
                  i18nKey="modalConfirmInformation.content.descriptionForBM"
                  components={{ b: <b />, br: <br /> }}
                  values={{ currencySymbol, creditBalance: numberUtils.formatTwoDigitsDecimal(creditBalance) }}
                />
              )}
            </Styled.Description>
            <Styled.Tools>
              {newTools.map((tool) => (
                <Styled.Tool key={tool}>
                  {/* @ts-ignore */}
                  <Styled.IconWrapper className="icon-checked" size={14} color={Colors.SECONDARY_50} />
                  <p>{tool}</p>
                </Styled.Tool>
              ))}
              <Styled.Note>
                {t('modalConfirmInformation.content.note')} <br />
              </Styled.Note>
            </Styled.Tools>
            <Styled.ButtonWrapper>
              <ButtonMaterial size={ButtonSize.XL} onClick={onCancel} color={ButtonColor.TERTIARY}>
                {t('common.cancel')}
              </ButtonMaterial>
              <ButtonMaterial size={ButtonSize.XL} onClick={onConfirm}>
                {t('modalConfirmInformation.confirmButtonTitle')}
              </ButtonMaterial>
            </Styled.ButtonWrapper>
          </Styled.Content>
        </Styled.RightWrapper>
      </Styled.Container>
    </Dialog>
  );
};

export default ModalConfirmInformation;
