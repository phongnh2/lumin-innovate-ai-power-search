import { IconButton, Menu, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { useChatbotMenu } from 'features/AIChatBot/hooks/useChatbotMenu';

import { FeedbackModal } from './components/FeedbackModal/FeedbackModal';
import { MenuItemProps, MenuPopover } from './components/MenuPopover/MenuPopover';

type ChatBotMenuProps = {
  menuItems: MenuItemProps[];
};

export const ChatBotMenu = (props: ChatBotMenuProps) => {
  const { menuItems } = props;
  const {
    openFeedbackModal,
    openMenu,
    setOpenMenu,
    feedbackValue,
    setFeedbackValue,
    onCloseFeedback,
    onConfirmFeedback,
  } = useChatbotMenu();
  const { t } = useTranslation();
  return (
    <>
      <FeedbackModal
        open={openFeedbackModal}
        onClose={onCloseFeedback}
        onConfirm={onConfirmFeedback}
        feedbackValue={feedbackValue}
        setFeedbackValue={setFeedbackValue}
      />

      <Menu
        ComponentTarget={
          <PlainTooltip content={t('viewer.chatbot.menu.more')} position="bottom-start" offset={{ crossAxis: 32 }}>
            <IconButton icon="ph-dots-three" onClick={() => setOpenMenu(!openMenu)} />
          </PlainTooltip>
        }
        itemSize="dense"
        position="bottom-end"
        opened={openMenu}
        onChange={(opened) => {
          setOpenMenu(opened);
        }}
      >
        <MenuPopover menuItems={menuItems} />
      </Menu>
    </>
  );
};
