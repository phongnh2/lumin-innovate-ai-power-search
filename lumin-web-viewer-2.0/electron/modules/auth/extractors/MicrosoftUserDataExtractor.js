class MicrosoftUserDataExtractor {
  extractUserData(payload, isDev = false) {
    const defaultData = {
      oid: '',
      cid: '',
      email: '',
    };

    if (!payload || typeof payload !== 'object') {
      if (isDev) {
        console.warn('[MicrosoftUserDataExtractor] Invalid or missing payload');
      }
      return defaultData;
    }

    const oid = payload.oid || '';
    const cid = this.extractCidFromOid(oid);
    const email = this.extractEmail(payload, isDev);

    return {
      oid,
      cid,
      email,
    };
  }

  extractCidFromOid(oid) {
    if (!oid || typeof oid !== 'string') {
      return '';
    }

    const cleanedOid = oid.replace(/-/g, '');
    if (cleanedOid.length < 16) {
      return '';
    }

    return cleanedOid.slice(16);
  }

  extractEmail(payload, isDev = false) {
    const email =
      payload.email || payload.preferred_username || payload.upn || payload.unique_name || payload.mail || '';

    if (!email && isDev) {
      console.warn('[MicrosoftUserDataExtractor] Unable to extract email from ID token', {
        availableClaims: Object.keys(payload),
      });
    }

    return email;
  }
}

module.exports = { MicrosoftUserDataExtractor };
