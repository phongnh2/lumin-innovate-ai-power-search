export const extractCidFromOid = (oid: string): string => {
  if (!oid || typeof oid !== 'string') {
    return '';
  }

  const cleanedOid = oid.replace(/-/g, '');
  if (cleanedOid.length < 16) {
    return '';
  }

  return cleanedOid.slice(16);
};

export const isValidAccessToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  return token.length > 50;
};

export const extractEmailFromClaims = (claims: Record<string, unknown>): string => {
  const email = claims.email || claims.preferred_username || claims.upn || claims.unique_name || claims.mail;

  return typeof email === 'string' ? email : '';
};
