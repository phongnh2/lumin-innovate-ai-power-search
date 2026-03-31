/* eslint-disable no-useless-escape */
export const PASSWORD_STRENGTH_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;

export const WHITE_SPACE_REGEX = /^\S+$/;

export const INPUT_NUMBER_REGEX = /^\d+$/;

export const HTML_TAG_REGEX = /(<([^>]+)>)/gi;

export const HTML_CHARACTERS_REGEX = /\s*\S*\="[^"]+"\s*/gm;

export const ALPHA_REGEX = /[^a-zA-Z]/g;

export const HEADER_TAG = {
  OPEN_TAG: /<h[^>]+>/g,
  CLOSE_TAG: /<\/h[^>]+>|iU/g,
};
export const getMatchingWordByKeyWordRegex = (keyWord) => new RegExp(`\\b${keyWord}\\b`, 'g');

// Note: Using negated character class [^;] instead of greedy quantifier (.+) prevents catastrophic backtracking
// and improves performance by stopping at the first semicolon
export const BASE64_IMAGE_REGEX = /^data:image\/([^;]+);base64,/;

export const HTML_CONTENT = />(.+)</i;

/**
 * Regular expression pattern that matches any CJK (Chinese, Japanese, Korean) character:
 * - Korean Hangul syllables: \uAC00-\uD7A3
 * - Japanese Hiragana and Katakana: \u3040-\u30FF
 * - Chinese/Kanji (CJK Unified Ideographs): \u4E00-\u9FFF
 */
export const CJK_UNICODE_REGEX = /[\uAC00-\uD7A3\u3040-\u30FF\u4E00-\u9FFF]/;