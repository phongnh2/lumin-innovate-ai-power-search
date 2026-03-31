class UrlUtils {
  static sanitizeURL(url: string): string | null {
    try {
      const parsedURL = new URL(url);
      return ['http:', 'https:'].includes(parsedURL.protocol) ? url : null;
    } catch (e) {
      return null;
    }
  }
}

export default UrlUtils;
