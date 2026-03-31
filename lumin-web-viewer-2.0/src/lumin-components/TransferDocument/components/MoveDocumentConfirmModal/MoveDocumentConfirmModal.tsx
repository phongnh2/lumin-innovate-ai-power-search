/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Checkbox, Modal, Text } from 'lumin-ui/kiwi-ui';
import React, { useState, ChangeEvent } from 'react';
import { Trans } from 'react-i18next';
import { ThemeProvider } from 'styled-components';

import Notify from 'assets/lumin-svgs/icons-sematic-notify.svg';

import Dialog from 'lumin-components/Dialog';
import {
  Destination,
  DestinationLocation,
} from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { THEME_MODE } from 'constants/lumin-common';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { IUser } from 'interfaces/user/user.interface';

import * as Styled from './MoveDocumentConfirmModal.styled';

import styles from './MoveDocumentConfirmModal.module.scss';

const getContent = (documents: IDocumentBase[], isEnableReskin?: boolean): JSX.Element => {
  const isMultiDocument = documents.length > 1;

  return (
    <span>
      <Trans
        i18nKey={isMultiDocument ? 'modalMove.loseAccessDocuments' : 'modalMove.loseAccessDocument'}
        values={isMultiDocument ? { documentsLength: documents.length } : { documentName: documents[0].name }}
        components={{ b: <b className={isEnableReskin ? styles.targetText : 'bold'} /> }}
      />
    </span>
  );
};

type Props = {
  visible?: boolean;
  onClose?: () => void;
  isMoving?: boolean;
  handleMoveDocuments?: ({ isNotify }: { isNotify: boolean }) => Promise<void>;
  destination?: Destination;
  documents?: IDocumentBase[];
  selectedTarget: IOrganization | IUser;
};

type InnerContentParams = {
  destinationName: string;
};

const MoveDocumentConfirmModal = ({
  visible,
  onClose,
  isMoving,
  handleMoveDocuments,
  destination,
  documents,
  selectedTarget,
}: Props): JSX.Element => {
  const [isNotify, setIsNotify] = useState(false);
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const getInnerContent = ({ destinationName }: InnerContentParams): JSX.Element => (
    <p>
      <Trans
        i18nKey="modalMove.ownershipTransferredToSpace"
        values={{ destinationName }}
        components={{ b: <b className={isEnableReskin ? styles.targetText : 'bold'} /> }}
      />{' '}
      {getContent(documents, isEnableReskin)}
    </p>
  );

  const getContentModal = (): JSX.Element => {
    const { name, type, belongsTo } = destination;
    const isInFolder = type === DestinationLocation.FOLDER;
    const destinationName = isInFolder ? belongsTo.name : name;
    const destinationType = isInFolder ? belongsTo.type : type;

    switch (destinationType) {
      case DOCUMENT_TYPE.ORGANIZATION_TEAM:
        return getInnerContent({ destinationName });
      case DOCUMENT_TYPE.ORGANIZATION: {
        const totalOrgMember = (selectedTarget as IOrganization).totalActiveMember;
        const innerContent = getInnerContent({ destinationName: `All ${destinationName}` });
        if (isEnableReskin) {
          return (
            <>
              {innerContent}
              {totalOrgMember > 1 && (
                <div className={styles.notifyWrapper}>
                  <Checkbox size="md" onChange={(e: ChangeEvent<HTMLInputElement>) => setIsNotify(e.target.checked)} />
                  <p>
                    <Trans
                      i18nKey={
                        totalOrgMember > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION
                          ? 'modalMove.notifyAdministrators'
                          : 'modalMove.notifyEveryone'
                      }
                      values={{ orgName: destinationName }}
                      components={{ b: <b className={styles.targetText} /> }}
                    />
                  </p>
                </div>
              )}
            </>
          );
        }
        return (
          <>
            {innerContent}
            {totalOrgMember > 1 && (
              <Styled.NotifyWrapper>
                <Styled.FormControlLabel
                  label={
                  <Styled.Notify>
                    <Trans
                      i18nKey={
                        totalOrgMember > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION
                          ? 'modalMove.notifyAdministrators'
                          : 'modalMove.notifyEveryone'
                      }
                        values={{ orgName: destinationName }}
                        components={{ b: <span className="bold" /> }}
                    />
                    </Styled.Notify>}
                  control={
                    <Styled.CheckBox
                      type="checkbox"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setIsNotify(e.target.checked)}
                    />
                  }
                  checked={isNotify}
                />
              </Styled.NotifyWrapper>
            )}
          </>
        );
      }
      default:
        return <p>{getContent(documents, isEnableReskin)}</p>;
    }
  };

  if (isEnableReskin) {
    return (
      <Modal
        opened={visible}
        onClose={onClose}
        size="sm"
        title={t('modalMove.confirmation')}
        confirmButtonProps={{
          title: isMoving ? t('common.moving') : t('common.move'),
        }}
        cancelButtonProps={{
          title: t('common.cancel'),
        }}
        isProcessing={isMoving}
        onConfirm={() => handleMoveDocuments({ isNotify })}
        onCancel={onClose}
        zIndex="var(--zindex-kiwi-modal-high)"
        centered
      >
        <Text
          type="body"
          size="md"
          component="span"
          style={{ wordBreak: 'break-word' }}
          color="var(--kiwi-colors-surface-on-surface-variant)"
        >
          {getContentModal()}
        </Text>
      </Modal>
    );
  }

  return (
    <ThemeProvider theme={Styled.theme[THEME_MODE.LIGHT]}>
      {/* @ts-ignore */}
      <Dialog open={visible} onClose={onClose} PaperComponent={Styled.Paper}>
        <Styled.Container>
          <Styled.Image src={Notify} alt="notify" />
          <Styled.Title>{t('modalMove.confirmation')}</Styled.Title>
          <Styled.Content>{getContentModal()}</Styled.Content>
          <Styled.ButtonContainer>
            <Styled.Button className="secondary" disabled={isMoving} onClick={onClose}>
              {t('common.cancel')}
            </Styled.Button>
            <Styled.Button
              className="primary"
              loading={isMoving}
              disabled={isMoving}
              onClick={() => handleMoveDocuments({ isNotify })}
            >
              {isMoving ? t('common.moving') : t('common.move')}
            </Styled.Button>
          </Styled.ButtonContainer>
        </Styled.Container>
      </Dialog>
    </ThemeProvider>
  );
};

MoveDocumentConfirmModal.defaultProps = {
  visible: false,
  onClose: () => {},
  handleMoveDocuments: () => {},
  isMoving: false,
  documents: [],
  destination: {},
};

export default MoveDocumentConfirmModal;
