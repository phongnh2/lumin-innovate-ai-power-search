/**
 * Converts a hex color string to a Core.Annotations.Color object
 * @param hexColor - Hex color string (e.g., '#FF69B4' or 'FF69B4')
 * @returns Core.Annotations.Color instance with RGBA values
 */
export function hexToColor(hexColor: string): Core.Annotations.Color {
  // Remove the # if it exists
  const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;

  // Parse the hex values to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // If there's an alpha channel (8-digit hex), use it, otherwise default to 1 (255)
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) : 255;

  // Create and return a new Color object
  return new window.Core.Annotations.Color(r, g, b, a);
}
