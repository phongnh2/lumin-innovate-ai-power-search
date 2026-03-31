/**
 * Regex for matching font declarations in style attributes
 * @example
 * // Matches quoted font names
 * "font:'Roboto Mono' 12pt"
 * // Matches unquoted font names
 * "font:Roboto Mono 12pt"
 *
 * @description
 * Pattern breakdown:
 * - font:\s*                    - Matches 'font:' with optional whitespace
 * - (?:                        - Non-capturing group for font name alternatives
 *   - '([^']+)'               - Group 1: Matches quoted font name
 *   - |                       - OR
 *   - ([^\s]+(?:\s+[^\s]+)*) - Group 2: Matches unquoted font name with spaces
 * - \s+\d+                     - Matches spaces followed by font size number
 * - (pt|px)                    - Group 3: Matches size unit
 */
export const fontNameRegex = /font:\s*(?:'([^']+)'|([^\s]+(?:\s+[^\s]+)*))\s+\d+(pt|px)/;

/**
 * Regex for matching font-family with Bold/Italic suffixes in style attributes
 * Handles various whitespace patterns around the font name and suffix
 *
 * Pattern breakdown:
 * - font-family:     - Matches the CSS property name
 * - \s*             - Matches optional whitespace after the colon
 * - ([^;]+?)        - Group 1: Captures the base font name (non-greedy)
 * - \s*             - Matches optional whitespace before the hyphen
 * - -               - Matches the hyphen separator
 * - (Bold)?         - Group 2: Optional 'Bold' suffix
 * - (Italic)?       - Group 3: Optional 'Italic' suffix
 * - (?=\s*;)        - Positive lookahead for semicolon with optional whitespace
 * - /g              - Global flag to replace all occurrences
 *
 * @example
 * // All of these will match:
 * "font-family:Lora-Bold;"          // No spaces
 * "font-family: Lora-Bold;"         // Space after colon
 * "font-family:Lora -Bold;"         // Space before suffix
 * "font-family: Lora -Bold ;"       // Multiple spaces
 *
 * // Capturing groups for "font-family: Lora-BoldItalic;"
 * // Group 1: "Lora"      - Base font name
 * // Group 2: "Bold"      - Bold suffix if present
 * // Group 3: "Italic"    - Italic suffix if present
 */
export const fontFamilyRegex = /font-family:\s*([^;]+?)\s*-(Bold)?(Italic)?(?=\s*;)/g;

export const boldItalicRegex = /-(Bold)?(Italic)?$/;

/**
 * Converts a font name to PascalCase
 * @example
 * // Returns "RobotoMono"
 * toPascalCase("Roboto Mono")
 * // Returns "InterBold"
 * toPascalCase("Inter-Bold")
 */
export const toPascalCase = (str: string): string =>
  str
    .replace(/[-\s]+/g, ' ') // Convert hyphens to spaces
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');