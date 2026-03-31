import { TFunction } from 'react-i18next';

import { renderActiveClass } from 'helpers/freeTextStyle';

import { eventTracking } from 'utils';

import { AnnotationSubjectMapping } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';

export const DEFAULT_RICH_TEXT_ID = 'richTextId';
export const HIGHLIGHT_ID = 'highLightId';
export const COMMENT_ID = 'commentId';
export const WHITE_SPACE = ' ';

export const richTextIdMapping = {
  [AnnotationSubjectMapping.highlight]: HIGHLIGHT_ID,
  [AnnotationSubjectMapping.stickyNote]: COMMENT_ID,
};

// add 'header' to accept h tag when user copied content from another source
export const toolbarOptions = ['bold', 'italic', 'underline', 'header'];

export const handleShortCut = (key: string): IShortcutType => ({
  key,
  shortKey: true,
  handler() {
    return true;
  },
});

export const isFormattedContent = (format = {}): boolean =>
  Object.keys(format).some((contentValue) => toolbarOptions.includes(contentValue));

export const getModuleById = (moduleId: string): object => ({
  toolbar: {
    container: `#${moduleId}`,
  },
  keyboard: {
    bindings: {
      bold: handleShortCut('b'),
      italic: handleShortCut('i'),
      underline: handleShortCut('u'),
    },
  },
});

export interface IShortcutType {
  key: string;
  shortKey: boolean;
  handler: () => boolean;
}

export interface ITextStyleItem {
  icon: string;
  toolTipContent: string;
  isActive: boolean;
  styleName: string;
  shortcut: string;
  onClick: () => void;
}

export const TEXT_DECORATION = 'text-decoration';

export enum TextStyle {
  ITALIC = 'ITALIC',
  UNDERLINE = 'UNDERLINE',
  BOLD = 'BOLD',
}

export const eventHandler = (key = ''): void => {
  let elementName = '';
  let elementPurpose = '';
  switch (key) {
    case TextStyle.ITALIC: {
      elementName = 'italiciseInComment';
      elementPurpose = 'Italicise';
      break;
    }
    case TextStyle.BOLD: {
      elementName = 'boldInComment';
      elementPurpose = 'Bold';
      break;
    }
    case TextStyle.UNDERLINE: {
      elementName = 'underlineInComment';
      elementPurpose = 'Underline';
      break;
    }
    default: {
      break;
    }
  }
  if (!elementName || !elementPurpose) {
    return;
  }
  eventTracking(UserEventConstants.EventType.CLICK, {
    elementName,
    elementPurpose: `${elementPurpose} notes or comments`,
  }) as unknown as void;
};

export const textStyleList = (translator: TFunction): ITextStyleItem[] => [
  {
    icon: 'tool-bold',
    toolTipContent: translator('option.richText.bold'),
    isActive: renderActiveClass('bold') as boolean,
    styleName: TextStyle.BOLD,
    shortcut: translator('shortcut.richText.bold'),
    onClick: () => {
      eventHandler(TextStyle.BOLD);
    },
  },
  {
    icon: 'tool-italic',
    toolTipContent: translator('option.richText.italic'),
    isActive: renderActiveClass('italic') as boolean,
    styleName: TextStyle.ITALIC,
    shortcut: translator('shortcut.richText.italic'),
    onClick: () => {
      eventHandler(TextStyle.ITALIC);
    },
  },
  {
    icon: 'tool-underline',
    toolTipContent: translator('option.richText.underline'),
    isActive: renderActiveClass('underline') as boolean,
    styleName: TextStyle.UNDERLINE,
    shortcut: translator('shortcut.richText.underline'),
    onClick: () => {
      eventHandler(TextStyle.UNDERLINE);
    },
  },
];
