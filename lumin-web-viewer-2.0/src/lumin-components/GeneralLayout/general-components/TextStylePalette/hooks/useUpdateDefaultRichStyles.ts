import { useEffect, useState } from 'react';

import core from 'core';

import { FONT_WEIGHTS, FONT_STYLES, TEXT_DECORATIONS, RICH_STYLE_VALUES, RICH_STYLE_KEYS } from '../constants';
import { FontStylesTypes, FontWeightsTypes, RichFontStylesMap, RichStyleTypes, TextDecorationsTypes } from '../type';

export const useUpdateDefaultRichStyles = () => {
  const [currentStyles, setCurrentStyles] = useState<RichStyleTypes | null>(null);

  const defaultRichStyles = (core.getToolMode() as Core.Tools.FreeTextCreateTool).defaults
    ?.RichTextStyle as Core.Annotations.Annotation.RichTextCSSStyle[];

  const toggleFonts = <T extends keyof RichFontStylesMap>(
    key: T,
    active: RichFontStylesMap[T],
    normal: RichFontStylesMap[T]
  ) => {
    if (!defaultRichStyles?.[0] || !currentStyles) {
      return;
    }

    const activeFontStyle = currentStyles[key] === active ? normal : active;
    defaultRichStyles[0][key] = activeFontStyle;
    setCurrentStyles({ ...currentStyles, [key]: activeFontStyle });
  };

  const toggleDecoration = (value: string) => {
    if (!defaultRichStyles?.[0] || !currentStyles) {
      return;
    }

    const decorations = currentStyles[RICH_STYLE_KEYS.TEXT_DECORATION].split(' ');
    const index = decorations.indexOf(value);

    /**
     * the rich text decoration is a string of space-separated values
     * e.g. 'word line-through' or only 'word' or only 'line-through'
     * so we need to check to separate the string
     */
    if (index >= 0) {
      decorations.splice(index, 1);
    } else {
      decorations.push(value);
    }

    const activeDecoration = decorations.length
      ? (decorations.join(' ') as TextDecorationsTypes)
      : TEXT_DECORATIONS.NONE;

    defaultRichStyles[0][RICH_STYLE_KEYS.TEXT_DECORATION] = activeDecoration;
    setCurrentStyles({ ...currentStyles, [RICH_STYLE_KEYS.TEXT_DECORATION]: activeDecoration });
  };

  const onUpdate = (actionKey: string) => {
    if (!defaultRichStyles?.[0] || !currentStyles) return;

    switch (actionKey) {
      case RICH_STYLE_VALUES.BOLD: {
        toggleFonts(RICH_STYLE_KEYS.FONT_WEIGHT, FONT_WEIGHTS.BOLD, FONT_WEIGHTS.NORMAL);
        break;
      }
      case RICH_STYLE_VALUES.ITALIC: {
        toggleFonts(RICH_STYLE_KEYS.FONT_STYLE, FONT_STYLES.ITALIC, FONT_STYLES.NORMAL);
        break;
      }
      case RICH_STYLE_VALUES.WORD: {
        toggleDecoration(TEXT_DECORATIONS.WORD);
        break;
      }
      case RICH_STYLE_VALUES.LINE_THROUGH: {
        toggleDecoration(TEXT_DECORATIONS.LINE_THROUGH);
        break;
      }
      default: {
        break;
      }
    }
  };

  useEffect(() => {
    if (!defaultRichStyles?.[0]) return;

    setCurrentStyles({
      [RICH_STYLE_KEYS.FONT_WEIGHT]: (defaultRichStyles[0]['font-weight'] as FontWeightsTypes) || FONT_WEIGHTS.NORMAL,
      [RICH_STYLE_KEYS.FONT_STYLE]: (defaultRichStyles[0]['font-style'] as FontStylesTypes) || FONT_STYLES.NORMAL,
      [RICH_STYLE_KEYS.TEXT_DECORATION]:
        (defaultRichStyles[0]['text-decoration'] as TextDecorationsTypes) || TEXT_DECORATIONS.NONE,
    });
  }, []);

  return { currentStyles, defaultRichStyles, onUpdate };
};
