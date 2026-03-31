import { Modal } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import InfoIcon from 'assets/lumin-svgs/icon-info.svg';
import TransferModalImage from 'assets/reskin/images/transfer-ownership.png';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import Dialog from 'luminComponents/Dialog';

import { useEnableWebReskin, useTabletMatch, useTranslation } from 'hooks';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from './MemberOrgRowTransferModal.styled';

import styles from './MemberOrgRowTransferModal.module.scss';

const MemberOrgRowTransferModal = ({ onClose, onSave, member }) => {
  const isTabletMatch = useTabletMatch();
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <Modal
        opened
        onClose={onClose}
        title={t('transferModal.title', { memberEmail: member.email })}
        titleCentered
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        Image={<img src={TransferModalImage} alt="transfer-modal-image" style={{ height: '90px' }} />}
        message={
          <div>
            <Trans
              i18nKey="transferModal.message"
              components={{ b: <b className="kiwi-message--primary" /> }}
              values={{ memberName: member.name, memberEmail: member.email }}
            />
            <br />
            <br />
            <Trans
              i18nKey="transferModal.message1"
              components={{
                b: <b className="kiwi-message--primary" />,
                Link: (
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                  <a
                    target="_blank"
                    rel="noreferrer noopener"
                    className={styles.link}
                    href={STATIC_PAGE_URL + getFullPathWithPresetLang('/terms-of-use')}
                  />
                ),
              }}
            />
          </div>
        }
        confirmButtonProps={{
          title: t('common.transferNow'),
        }}
        cancelButtonProps={{
          title: t('common.cancel'),
        }}
        onConfirm={onSave}
        onCancel={onClose}
      />
    );
  }

  return (
    // eslint-disable-next-line no-magic-numbers
    <Dialog open onClose={onClose} width={isTabletMatch ? 400 : 328}>
      <Styled.Container>
        <Styled.AvatarWrapper src={InfoIcon} />
        <Styled.Title>{t('transferModal.title', { memberEmail: member.email })}</Styled.Title>
        <Styled.Content>
          <Styled.Description>
            <Trans
              i18nKey="transferModal.message"
              components={{ b: <b /> }}
              values={{ memberName: member.name, memberEmail: member.email }}
            />
          </Styled.Description>
          <Styled.Description>
            <Trans
              i18nKey="transferModal.message1"
              components={{
                b: <b />,
                // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                Link: <a target="_blank" rel="noreferrer noopener" href={STATIC_PAGE_URL + getFullPathWithPresetLang('/terms-of-use')} />,
              }}
            />
          </Styled.Description>
        </Styled.Content>
        <Styled.ButtonWrapper>
          <ButtonMaterial color={ButtonColor.TERTIARY} size={ButtonSize.XL} onClick={onClose}>
            {t('common.cancel')}
          </ButtonMaterial>
          <ButtonMaterial size={ButtonSize.XL} onClick={onSave}>
            {t('common.transferNow')}
          </ButtonMaterial>
        </Styled.ButtonWrapper>
      </Styled.Container>
    </Dialog>
  );
};

MemberOrgRowTransferModal.propTypes = {
  member: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};

MemberOrgRowTransferModal.defaultProps = {
  member: {},
  onClose: () => { },
  onSave: () => { },
};

export default MemberOrgRowTransferModal;
