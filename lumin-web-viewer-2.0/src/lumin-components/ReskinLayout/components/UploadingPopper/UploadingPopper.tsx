import classNames from 'classnames';
import { Paper } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useExtraSmallMatch, useNetworkStatus } from 'hooks';

import { IframeMessageListenerPayload, isValidIframeAction } from 'utils/signIframeUtil';

import { MessagingEvents } from 'constants/signConstants';

import { UploadingPopperBody, UploadingPopperHeader } from './components';
import { useToggleCollapse } from './hooks';
import useIsUploadablePage from './hooks/useIsUploadablePage';

import styles from './UploadingPopper.module.scss';

type TActionName = 'upload_contract';
interface MessageListenerPayload extends IframeMessageListenerPayload<TActionName> {
  data?: {
    id: string;
  };
}

const UploadingPopper = () => {
  const { isOffline } = useNetworkStatus();
  const isExtraSmall = useExtraSmallMatch();

  const { isUploadablePage } = useIsUploadablePage();
  const { isCollapsed, toggleCollapse } = useToggleCollapse();

  const openUploadingPopper = useSelector(selectors.isOpenUploadingPopper);

  const [isOpenSignIframe, setIsOpenSignIframe] = useState(false);

  useEffect(() => {
    const closePopper = () => {
      setIsOpenSignIframe(true);
    };

    window.addEventListener(MessagingEvents.PickFiles, closePopper);

    return () => {
      window.removeEventListener(MessagingEvents.PickFiles, closePopper);
    };
  }, []);

  useEffect(() => {
    const listenToLuminSign = (e: MessageEvent<MessageListenerPayload>) => {
      if (!isValidIframeAction<TActionName, MessageListenerPayload>(e, 'upload_contract')) {
        return;
      }
      setIsOpenSignIframe(false);
    };
    window.addEventListener('message', listenToLuminSign, false);
    return () => {
      window.removeEventListener('message', listenToLuminSign);
    };
  }, []);

  if (!openUploadingPopper || isExtraSmall || isOpenSignIframe || !isUploadablePage) {
    return null;
  }

  return createPortal(
    <Paper className={classNames(styles.container, { [styles.hidden]: isOffline })} elevation="lg" radius="md">
      <UploadingPopperHeader isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      <UploadingPopperBody isCollapsed={isCollapsed} />
    </Paper>,
    document.body
  );
};

export default React.memo(UploadingPopper);
