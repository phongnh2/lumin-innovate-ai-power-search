import { isEmail } from 'validator';

import { documentStorage } from 'constants/documentConstants';

export const isOwnerOfAllAnnotations = ({ currentUser, currentDocument, selectedAnnotations }) => {
  if (currentDocument.isSystemFile || currentDocument.temporaryEdit) {
    return {
      isUniqueOwner: true,
      otherAuthors: [],
    };
  }

  const isValidDocument = [documentStorage.google, documentStorage.s3, documentStorage.caching].includes(
    currentDocument.service
  );

  const currentUserEmail = currentUser.email;

  const isNotMineAnnotations = selectedAnnotations.filter((annotation) => {
    const annotationAuthor = annotation.Author || '';
    return isEmail(annotationAuthor) && currentUserEmail !== annotationAuthor;
  });

  const authors = [...new Set(isNotMineAnnotations.map((annotation) => annotation.Author))];

  return {
    isUniqueOwner: isNotMineAnnotations.length === 0,
    otherAuthors: authors,
    isValidDocument,
  };
};
