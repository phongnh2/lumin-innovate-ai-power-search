local claims = std.extVar('claims');

{
  identity: {
    traits: {
      [if "email" in claims then "email" else null]: std.asciiLower(claims.email),
      // additional claims
      name: std.join(" ", [
        if "given_name" in claims then claims.given_name else null, 
        if "family_name" in claims then claims.family_name else null
      ]),
      [if "hd" in claims then "hd" else null]: claims.hd,
      [if "sub" in claims then "sub" else null]: claims.sub,
      loginService: 'DROPBOX',
    },
    verified_addresses: std.prune([
      // Carry over verified status from Social Sign-In provider.
      if 'email' in claims && claims.email_verified then { via: 'email', value: claims.email },
    ]),
  },
}
