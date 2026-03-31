/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Dialog } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import ModalSkeleton from 'lumin-components/CommonSkeleton/ShareModal.skeleton';
import { LazyContentDialog } from 'lumin-components/Dialog';
import { useTransferDocumentContext } from 'lumin-components/TransferDocument/hooks';
import { ITransferDocumentContext } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import withLightTheme from 'HOC/withLightTheme';

import { useEnableWebReskin } from 'hooks';

import { ModalSize } from 'constants/styles/Modal';

import Footer from './components/Footer';
import Header from './components/Header';
import TransferDocumentBody from './components/TransferDocumentBody';

import * as Styled from './TransferDocument.styled';

import styles from './TransferDocument.module.scss';

function TransferDocument(): JSX.Element {
  const [searching, setSearching] = useState(false);
  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const { isProcessing } = getter;
  const { onClose } = setter;

  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <Dialog
        opened
        centered
        onClose={onClose}
        size="md"
        padding="none"
        closeOnClickOutside={!isProcessing}
        closeOnEscape={!isProcessing}
        classNames={{ content: styles.content, body: styles.body }}
      >
        <Header setSearching={setSearching} searching={searching} />
        <Styled.TransferDocumentContainer>
          <TransferDocumentBody />
          <Footer />
          <Styled.BackdropReskin $open={searching} />
        </Styled.TransferDocumentContainer>
      </Dialog>
    );
  }

  return (
    <LazyContentDialog
      open
      width={ModalSize.MDX}
      noPadding
      fallback={<ModalSkeleton />}
      title=""
      disableBackdropClick={isProcessing}
      disableEscapeKeyDown={isProcessing}
      onClose={onClose}
    >
      <Header setSearching={setSearching} searching={searching} />
      <Styled.TransferDocumentContainer>
        <TransferDocumentBody />
        <Footer />
        <Styled.Backdrop $open={searching} />
      </Styled.TransferDocumentContainer>
    </LazyContentDialog>
  );
}

export default withLightTheme(TransferDocument);
