import { toPascalCase } from './regex';

export type RGBColor = Record<'R' | 'G' | 'B', number>;

export interface TransformFontNameOptions {
  /** Original font name */
  fontName: string;
  /** Font style object containing weight and style information */
  fontStyle: Core.Annotations.Annotation.RichTextCSSStyle;
  /** Whether to convert the base name to PascalCase */
  toPascal?: boolean;
}

export interface StyleOptions {
  fontName: string;
  fontSize: string;
  textAlign: string;
  hexColor: string;
}

/**
 * Transform font name by optionally converting to PascalCase and adding style suffixes
 * @example
 * // Returns "RobotoMono-BoldItalic"
 * getTransformedFontName({
 *   fontName: "Roboto Mono",
 *   fontStyle: { 'font-weight': 'bold', 'font-style': 'italic' }
 * })
 * // Returns "Roboto Mono-BoldItalic"
 * getTransformedFontName({
 *   fontName: "Roboto Mono",
 *   fontStyle: { 'font-weight': 'bold', 'font-style': 'italic' },
 *   toPascal: false
 * })
 */
export function getTransformedFontName({ fontName, fontStyle, toPascal = true }: TransformFontNameOptions): string {
  const baseName = toPascal ? toPascalCase(fontName) : fontName;
  const suffixes = [];

  if (fontStyle['font-weight'] === 'bold') {
    suffixes.push('Bold');
  }
  if (fontStyle['font-style'] === 'italic') {
    suffixes.push('Italic');
  }

  return suffixes.length > 0 ? `${baseName}-${suffixes.join('')}` : baseName;
}

export const convertRGBToNormalized = ({ R, G, B }: RGBColor) => ({
  r: R / 255,
  g: G / 255,
  b: B / 255,
});

export const createDefaultAppearance = (
  color: ReturnType<typeof convertRGBToNormalized>,
  fontName: string,
  fontSize: string
) => `${color.r} ${color.g} ${color.b} rg /${fontName} ${fontSize.replace('pt', '')} Tf`;

/**
 * Format font name for CSS, wrapping in quotes if it contains spaces
 * @param fontName The font name to format
 * @returns Formatted font name
 * @example
 * // Returns "Roboto"
 * formatFontName("Roboto")
 * // Returns "'Roboto Mono'"
 * formatFontName("Roboto Mono")
 */
export const formatFontName = (fontName: string): string => (fontName.includes(' ') ? `'${fontName}'` : fontName);

export const createDefaultStyle = ({ fontName, fontSize, textAlign, hexColor }: StyleOptions) =>
  `font: ${formatFontName(fontName)} ${fontSize}; text-align: ${textAlign}; color: #${hexColor}`;

/**
 * Process font tokens until we find one starting with '/'
 * Each token is cleaned by removing leading '/' if present
 * @param tokens Array of tokens to process
 * @returns Array of cleaned font tokens
 */
export const collectFontTokens = (tokens: string[]): string[] => {
  const result: string[] = [];
  let currentToken = tokens.pop() || '';

  do {
    result.push(currentToken.replace(/^\//, ''));
    if (currentToken.includes('/')) break;
    currentToken = tokens.pop() || '';
  } while (currentToken);

  return result;
};
