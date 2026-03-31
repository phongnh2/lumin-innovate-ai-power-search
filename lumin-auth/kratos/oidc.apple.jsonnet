local claims = {
  email_verified: false
} + std.extVar('claims');

local email = 
  if 'email' in claims && claims.email_verified 
  then std.asciiLower(claims.email) 
  else null;

local isPrivateRelay = 
  email != null && std.endsWith(email, '@privaterelay.appleid.com');

local relayName = 
  if isPrivateRelay 
  then std.split(email, '@')[0] 
  else null;

local default(d, x) = 
  if x == null then d else x;

local fullName = 
  default('', if 'given_name' in claims then claims.given_name else null) + ' ' +
  default('', if 'family_name' in claims then claims.family_name else null);

local trimmedFullName = std.stripChars(fullName, ' ');

local username =
  if relayName != null 
  then relayName
  else if trimmedFullName != '' 
  then trimmedFullName
  else 'Lumin User';

{
  identity: {
    traits: {
      [if "email" in claims && claims.email_verified then "email" else null]: std.asciiLower(claims.email),
      [if "sub" in claims && claims.email_verified then "sub" else null]: claims.sub,
      name: username,
      loginService: 'APPLE',
    },
    verified_addresses: std.prune([
      // Carry over verified status from Social Sign-In provider.
      if 'email' in claims && claims.email_verified then { via: 'email', value: claims.email },
    ]),
  },
}
