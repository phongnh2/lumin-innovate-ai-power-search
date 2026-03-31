local claims = {
  email_verified: true
} + std.extVar('claims');

{
  identity: {
    traits: {
      [if "email" in claims && claims.email_verified then "email" else null]: std.asciiLower(claims.email),
      name: std.join(" ", [
        if "given_name" in claims then claims.given_name else null, 
        if "family_name" in claims then claims.family_name else null
      ]),
      [if "sub" in claims && claims.email_verified then "sub" else null]: claims.sub,
      loginService: 'XERO',
    },
    verified_addresses: std.prune([
      if 'email' in claims && claims.email_verified then { via: 'email', value: claims.email },
    ]),
  },
}
