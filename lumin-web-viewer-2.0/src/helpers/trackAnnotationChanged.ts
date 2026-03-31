import { UserData } from '@new-ui/components/LuminCommentBox/components/LuminNoteHeader/types';

import core from 'core';

import mentionsManager from 'helpers/MentionsManager';

import { comment, eventTracking } from 'utils';

import { CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';
import { AnnotationSubjectMapping, ANNOTATION_ACTION } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';

function getMentioneeIds(annotation: Core.Annotations.Annotation): string[] {
  const mentionUserList = mentionsManager.getUserData() as UserData[];

  if (!mentionUserList.length) {
    return [];
  }

  const emailToUserIdMapper: Record<string, string> = mentionUserList.reduce(
    (acc, { email, id }) => ({ ...acc, [email]: id }),
    {}
  );

  const emailsFromContent = comment.getMentionEmailsFromContent(comment.removeHTMLTag(annotation.getContents()));

  if (!emailsFromContent.length) {
    return [];
  }

  return Array.from(emailsFromContent, (email) => emailToUserIdMapper[email]).filter((id) => id);
}

async function trackCommentCreated(commentAnnots: Core.Annotations.Annotation[], storage: string) {
  const addedCommentActions = commentAnnots.filter((annotation) => {
    const commentContentStatus = annotation.getCustomData(CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.key);
    return commentContentStatus === CUSTOM_DATA_COMMENT.COMMENT_CONTENT_STATUS.added;
  });

  const luminUserIdMentionList = commentAnnots.map((annotation) => getMentioneeIds(annotation));

  await eventTracking(UserEventConstants.EventType.COMMENT_CREATED, {
    source: storage,
    total: addedCommentActions.length,
    ...(luminUserIdMentionList.length && { LuminUserIdMentionee: luminUserIdMentionList }),
  });
}

function filterAnnotsNeedToTracking(annot: Core.Annotations.Annotation) {
  return !annot.isContentEditPlaceholder();
}

async function trackAnnotationChanged(
  annotations: Core.Annotations.Annotation[],
  action: string,
  storage: string
): Promise<void> {
  const eventInfo = {
    source: storage,
    type: core.getToolMode()?.name,
  };
  const filteredAnnots = annotations.filter(filterAnnotsNeedToTracking);
  const totalAnnots = filteredAnnots.length;
  if (!totalAnnots) {
    return;
  }
  const commentAnnots = filteredAnnots.filter((annot) => annot.Subject === AnnotationSubjectMapping.stickyNote);
  const totalComments = commentAnnots.length;
  const totalAnnotsWithoutComments = totalAnnots - totalComments;
  switch (action) {
    case ANNOTATION_ACTION.ADD: {
      if (totalAnnotsWithoutComments > 0) {
        await eventTracking(UserEventConstants.EventType.ANNOTATION_CREATED, {
          ...eventInfo,
          total: totalAnnotsWithoutComments,
        });
      }
      break;
    }
    case ANNOTATION_ACTION.MODIFY: {
      await Promise.all([
        totalComments > 0 && trackCommentCreated(commentAnnots, storage),
        eventTracking(UserEventConstants.EventType.ANNOTATION_MODIFIED, {
          ...eventInfo,
          total: totalAnnotsWithoutComments,
        }),
      ]);
      break;
    }
    case ANNOTATION_ACTION.DELETE: {
      await eventTracking(UserEventConstants.EventType.ANNOTATION_DELETED, {
        ...eventInfo,
        total: totalAnnotsWithoutComments,
      });
      break;
    }
    default:
      break;
  }
}

export default trackAnnotationChanged;
