import { IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import { motion } from 'motion/react';
import React from 'react';
import { useSelector } from 'react-redux';

import { useTranslation } from 'hooks/useTranslation';

import { FEEDBACK_TYPE } from 'features/AIChatBot/constants';
import { FeedbackType } from 'features/AIChatBot/interface';
import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

interface ThumbButtonProps {
  type: FeedbackType;
  isActive: boolean;
  onClick: (type: FeedbackType) => void;
}

const ICON_MAPPING = {
  [FEEDBACK_TYPE.LIKE]: {
    active: 'ph-thumbs-up-fill',
    inactive: 'ph-thumbs-up',
  },
  [FEEDBACK_TYPE.DISLIKE]: {
    active: 'ph-thumbs-down-fill',
    inactive: 'ph-thumbs-down',
  },
};

export const ThumbButton = ({ type, isActive, onClick }: ThumbButtonProps) => {
  const { t } = useTranslation();
  const { feedbackType, isSubmitted } = useSelector(editorChatBotSelectors.getFeedbackStates);
  const icon = ICON_MAPPING[type][isActive ? 'active' : 'inactive'];

  return (
    <motion.div
      key={isActive ? `${type}-active` : type}
      initial={{ opacity: 0, transform: 'scale(0.8)' }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
      exit={{ opacity: 0.5, transform: 'scale(0.8)' }}
      transition={{ duration: 0.25 }}
    >
      <PlainTooltip
        content={t(`viewer.chatbot.feedback.tooltip.${type === FEEDBACK_TYPE.LIKE ? 'helpful' : 'notHelpful'}`)}
        position="bottom"
      >
        <IconButton
          icon={icon}
          size="md"
          onClick={() => onClick(type)}
          disabled={isSubmitted && feedbackType !== type}
        />
      </PlainTooltip>
    </motion.div>
  );
};
