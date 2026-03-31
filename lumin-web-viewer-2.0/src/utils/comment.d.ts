import { IUser } from 'interfaces/user/user.interface';

declare namespace commentUtils {
  function isDeleteTagSymbol(content: string, comment: string): boolean;

  function removeHTMLTag(comment: string): string;

  function getHTMLTagsInString(comment: string): Array<string>;

  function commentParser(comment: string): Array<string>;

  function getEmailsFromContent(currentUser: IUser, removedHtmlComment: string): Array<string>;

  function redoMarkupSymbol(comment: string): string;

  function clearAllMarkupSymbol(comment: string): string;

  function getMentionEmailsFromContent(content: string): Array<string>;
}

export default commentUtils;
