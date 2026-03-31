const MAXIMUM_TEXT_INPUT = 255;

export const getAllowedFileName = (fileName: string): string =>
  fileName.slice(-MAXIMUM_TEXT_INPUT);

export const getMd5Hash = async (file: File): Promise<string | null> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return btoa(hashHex);
  } catch (error) {
    console.error("Error generating hash:", error);
    return null;
  }
};
