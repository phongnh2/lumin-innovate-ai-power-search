import { comment, validator } from 'utils';

import { IUser } from 'interfaces/user/user.interface';

import { getAuthorName } from './getAuthorName';

export const getRenderedMention = async ({
  annotation,
  text,
  currentUser,
}: {
  annotation: Core.Annotations.Annotation;
  text: string;
  currentUser: IUser;
}): Promise<string> => {
  const textArray = text.split(' ');
  const replacedArray = await Promise.all(
    textArray.map(async (word) => {
      const splitWord = word.split(/\r|\n/);
      const splitWordsArray = await Promise.all(
        splitWord.map((sWord) => {
          const mentionSymbolOccurs = sWord.split('@');
          const mentionStartPosition = sWord.search('@');
          const isMentionEmail = mentionSymbolOccurs.length === 3 && mentionStartPosition !== -1;
          const authorEmail = isMentionEmail ? comment.removeHTMLTag(sWord.substr(mentionStartPosition + 1)) : '';
          if (isMentionEmail && validator.validateEmail(authorEmail)) {
            const name = getAuthorName({
              currentUser,
              authorEmail,
              annotation,
            });
            const HTMLCharactersInComment = comment.getHTMLTagsInString(sWord).join('');
            if (!name) return sWord;
            if (name.search('@') !== -1) return name;
            return `<span class="mention">${name}</span>${HTMLCharactersInComment}`;
          }
          return sWord;
        })
      );
      return splitWordsArray.join('\n');
    })
  );
  return replacedArray.join(' ');
};
