import { comment } from 'utils';

import { CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';

const removedMarkupSymbol = (commentAnnot: Core.Annotations.Annotation): string =>
  commentAnnot.getCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key) || commentAnnot.getContents();

export const getCommentContents = (commentAnnot: Core.Annotations.Annotation): string =>
  comment.redoMarkupSymbol(removedMarkupSymbol(commentAnnot));

export const getCommentReplies = (commentAnnot: Core.Annotations.Annotation): Core.Annotations.Annotation[] =>
  commentAnnot.getReplies().sort((a, b) => a.DateCreated.valueOf() - b.DateCreated.valueOf());
