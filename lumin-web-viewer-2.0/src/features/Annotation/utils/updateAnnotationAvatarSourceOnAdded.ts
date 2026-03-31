import pick from 'lodash/pick';

import selectors from 'selectors';
import { store } from 'store';

import { getUserInfoFromCommentAnnot } from 'features/Comments/utils';
import { formBuilderSelectors } from 'features/DocumentFormBuild/slices';
import { readAloudSelectors } from 'features/ReadAloud/slices';

import { CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';
import { TOOLS_NAME } from 'constants/toolsName';

import { IUser } from 'interfaces/user/user.interface';

const getUserInfo = ({ annotation, currentUser }: { annotation: Core.Annotations.Annotation; currentUser: IUser }) => {
  if (!currentUser) {
    return getUserInfoFromCommentAnnot({
      annotation,
      currentUser,
    });
  }

  return pick(currentUser, ['avatarRemoteId', 'name']);
};

export const updateAnnotationAvatarSourceOnAdded = (annotations: Core.Annotations.Annotation[]) => {
  const state = store.getState();
  const activeToolName = selectors.getActiveToolName(state);
  const isInRedactionMode = activeToolName === TOOLS_NAME.REDACTION;
  const isInContentEditMode = selectors.isInContentEditMode(state);
  const isInReadAloudMode = readAloudSelectors.isInReadAloudMode(state);
  const isInFormBuilderMode = formBuilderSelectors.isInFormBuildMode(state);
  if (isInRedactionMode || isInContentEditMode || isInReadAloudMode || isInFormBuilderMode) {
    return;
  }

  const currentUser = selectors.getCurrentUser(state);
  const { avatarRemoteId, name } = getUserInfo({ annotation: annotations[0], currentUser });
  annotations.forEach((annotation) => {
    annotation.setCustomData(
      CUSTOM_DATA_COMMENT.AVATAR_SOURCE.key,
      JSON.stringify({
        avatarRemoteId,
        name,
      })
    );
  });
};
