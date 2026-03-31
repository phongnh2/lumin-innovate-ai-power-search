export function extractDomainFromUrl(url?: string): string {
  if (!url) {
    return "";
  }

  try {
    const urlToParse = url.startsWith("http") ? url : `https://${url}`;
    const parsedUrl = new URL(urlToParse);
    return parsedUrl.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^www\./, "").replace(/^https?:\/\//, "");
  }
}

export function extractGoogleDriveFileId(url: string): string | null {
  const driveUrlPatterns = [
    /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/.*/,
    /https:\/\/drive\.google\.com\/open\?id=([^&]+)/,
  ];

  for (const pattern of driveUrlPatterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function convertToGoogleDriveDownloadUrl(url: string): string | null {
  const fileId = extractGoogleDriveFileId(url);
  return fileId ? `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media` : null;
}
