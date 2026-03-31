export function objectToBase64(obj: Record<string, unknown>) {
  const jsonString = JSON.stringify(obj); // Convert object to JSON string
  const bytes = new TextEncoder().encode(jsonString); // Convert to Uint8Array
  return btoa(String.fromCharCode(...bytes)); // Encode to Base64
}
