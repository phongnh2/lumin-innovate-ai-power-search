import DOMPurify from 'dompurify';
import { unescape as lodashUnescape } from 'lodash';

import getHeight from 'helpers/getHeight';

import { HTML_TAG_REGEX, HTML_CHARACTERS_REGEX } from 'utils/regex';

import validator from './validator';

/**
 * DOMPurity remove the target attribute by default so we need to add them into <a/> again
 */
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // set all elements owning target to target=_blank
  if ('target' in node) {
    node.setAttribute('target', '_blank');
    // prevent https://www.owasp.org/index.php/Reverse_Tabnabbing
    node.setAttribute('rel', 'noopener noreferrer');
  }
});
const COMMENT_BOX_PADDING = 10;

function getEmailsFromContent(currentUser, content) {
  if (!content) return [];
  const words = content.split(/\r|\n| /);
  const emails = words.map((word) => {
      if (word.startsWith('@')) {
        const email = word.slice(1);
        if (validator.validateEmail(word.slice(1)) && email !== currentUser.email) return email;
      }
    }).filter((email) => email);
  if (emails.length === 0) return [];
  return [...new Set(emails)];
}

function getNewTagUsers(taggedUsers, taggedUsersFromComment) {
  if (taggedUsers.length === 0) return taggedUsersFromComment;
  return taggedUsersFromComment.filter((email) => taggedUsers.every((taggedEmail) => taggedEmail !== email));
}

function commentParser(text = '') {
  // eslint-disable-next-line no-useless-escape
  const regexMentionOrLink = /(<span class=\"mention\">.*?<\/span>|<a\s.*?<\/a>)/g;
  return DOMPurify.sanitize(text).split(regexMentionOrLink);
}

function clearAllMarkupSymbol(text = '') {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function redoMarkupSymbol(text = '') {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function getIdealPlacement(commentBoxLocation, selectedCommentId) {
  const { sortedIdealPlacement, idx } = sortIdealPlacement(commentBoxLocation, selectedCommentId);
  return pushCommentBox(sortedIdealPlacement, idx);
}

function sortIdealPlacement(idealPlacement, selectedCommentId) {
  let findMe;
  const sortedIdealPlacement = Object.entries(idealPlacement)
    .map(([Id, cmt]) => {
      const loc = [Id, { top: cmt.top, height: getHeight(Id) }];
      if (Id === selectedCommentId) {
        findMe = loc;
      }
      return loc;
    }).sort((a, b) => a[1].top - b[1].top);

  const idx = findMe ? sortedIdealPlacement.indexOf(findMe) : 0;

  return { sortedIdealPlacement, idx };
}

function pushCommentBox(commentLocation, selectedIndex) {
  // Push upwards from target (or nothing)
  const before = commentLocation.slice(0, selectedIndex + 1).reduceRight((prev, [id, loc]) => {
    const { top } = prev[prev.length - 1]?.[1] ?? {};
    const newTop = Math.min(top - loc.height - COMMENT_BOX_PADDING, loc.top) || loc.top;
    const next = [id, { top: newTop, height: loc.height }];
    return [...prev, next];
  }, []);

  // Push comments downward
  const after = commentLocation.slice(selectedIndex).reduce((prev, [id, loc]) => {
    const { top, height } = prev[prev.length - 1]?.[1] ?? {};
    const newTop = Math.max(top + height + COMMENT_BOX_PADDING, loc.top) || loc.top;
    const next = [id, { top: newTop, height: loc.height }];
    return [...prev, next];
  }, []);

  return Object.fromEntries([...before, ...after]);
}

function removeHTMLTag(html = '') {
  return lodashUnescape(html.replace(HTML_TAG_REGEX, ''));
}

const getHTMLTagsInString = (string) => {
  const tagList = lodashUnescape(string).match(HTML_TAG_REGEX);
  if (!tagList) {
    return [];
  }
  return tagList.map((tag) => tag.replace(HTML_CHARACTERS_REGEX, ''));
};

function isDeleteTagSymbol(newContent, oldContent = '') {
  const oldArray = oldContent.split('');
  const newArray = newContent.split('');
  for (let i = 0; i < oldContent.length; i++) {
    if (oldArray[i] !== newArray[i] && oldArray[i] === '@') {
      return true;
    }
  }
  return false;
}

function getMentionEmailsFromContent(content) {
  if (!content) {
    return [];
  }
  const words = content.split(/\r|\n| /);
  const emails = words
    .filter((word) => word.startsWith('@') && validator.validateEmail(word.slice(1)))
    .map((word) => word.slice(1));
  return [...new Set(emails)];
}

export default {
  getEmailsFromContent,
  getNewTagUsers,
  commentParser,
  clearAllMarkupSymbol,
  redoMarkupSymbol,
  getIdealPlacement,
  removeHTMLTag,
  getHTMLTagsInString,
  isDeleteTagSymbol,
  getMentionEmailsFromContent,
};
