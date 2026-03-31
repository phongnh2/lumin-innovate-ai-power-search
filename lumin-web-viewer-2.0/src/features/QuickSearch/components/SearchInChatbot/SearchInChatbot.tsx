import { SparkleIcon } from '@luminpdf/icons/dist/csr/Sparkle';
import { MenuItem } from 'lumin-ui/kiwi-ui';
import { motion } from 'motion/react';
import React from 'react';
import { Trans } from 'react-i18next';

import { useChatbotCommandMenuItemStates } from '@new-ui/components/ChatbotCommandMenuItem/hooks/useChatbotCommandMenuItemStates';
import { LayoutElements } from '@new-ui/constants';

import fireEvent from 'helpers/fireEvent';

import { useChatbotInputObservation } from 'features/AIChatBot/hooks/useChatbotInputObservation';

import { CUSTOM_EVENT } from 'constants/customEvent';

const SearchInChatbot = ({ keyword }: { keyword: string }) => {
  const { isDisabled, isChatBotOpen } = useChatbotCommandMenuItemStates();

  const setChatbotInputMessage = (message: string) => {
    fireEvent(CUSTOM_EVENT.CHATBOT_AUTO_SET_INPUT_MESSAGE, {
      message,
    });
  };

  const [isChatbotInputPresent, setPendingAction] = useChatbotInputObservation(setChatbotInputMessage);

  const onClick = () => {
    if (isChatBotOpen && isChatbotInputPresent) {
      setChatbotInputMessage(keyword);
      return;
    }

    setPendingAction(keyword);
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.CHATBOT,
      isOpen: true,
    });
  };

  if (!keyword || isDisabled) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <MenuItem leftSection={<SparkleIcon size={24} color="var(--kiwi-colors-surface-on-surface)" />} onClick={onClick}>
        <Trans
          i18nKey="viewer.quickSearch.searchInChatbot"
          values={{ keyword }}
          components={{
            keyword: <span style={{ color: 'var(--kiwi-colors-surface-on-surface-low)' }} />,
          }}
        />
      </MenuItem>
    </motion.div>
  );
};

export default SearchInChatbot;
