import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';
import SvgElement from 'lumin-components/SvgElement';

import { useTranslation } from 'hooks/useTranslation';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { ShowValues } from 'constants/sortStrategies';

import { useAddFirstComment } from '../../hooks/useAddFirstComment';
import * as Styled from '../../LuminNoteHistoryPanel.styled';

interface EmptyCommentsProps {
  showNoteOption: string;
  canComment: boolean;
}

const EmptyComments = ({ showNoteOption, canComment }: EmptyCommentsProps): JSX.Element => {
  const { t } = useTranslation();
  const addTheFirstComment = useAddFirstComment();
  const isShowingComment = [ShowValues.SHOW_ALL, ShowValues.HIDE_NOTES].includes(showNoteOption);
  const label = !isShowingComment ? t('message.noAnnotations') : t('viewer.rightPanel.thereAreNoCommentsYet');
  const content = t('viewer.rightPanel.addCommentsAndAnnotations');

  const renderAddFirstCommentButton = (): JSX.Element => {
    if (!canComment || ![ShowValues.SHOW_ALL, ShowValues.HIDE_NOTES].includes(showNoteOption)) {
      return null;
    }

    return (
      <PlainTooltip content={content}>
        <Styled.AddNewCommentButton
          onClick={handlePromptCallback({ callback: addTheFirstComment })}
          variant="filled"
          startIcon={<Icomoon className="add-comment" size={18} />}
        >
          {t('viewer.rightPanel.addAComment')}
        </Styled.AddNewCommentButton>
      </PlainTooltip>
    );
  };

  return (
    <Styled.AddNewCommentWrapper>
      <SvgElement content="double-comment" width={80} height={65} />
      <Styled.NoCommentDescription>{label}</Styled.NoCommentDescription>
      {renderAddFirstCommentButton()}
    </Styled.AddNewCommentWrapper>
  );
};

export default EmptyComments;
