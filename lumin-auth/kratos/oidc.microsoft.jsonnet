local claims = {
  email_verified: true
} + std.extVar('claims');

local emailValue = if std.objectHas(claims, "email") then claims.email else claims.preferred_username;

local userNames = 
  if ("family_name" in claims) || ("given_name" in claims) then
    [
      if "family_name" in claims then claims.family_name else null,
      if "given_name" in claims then claims.given_name else null,
    ]
  else
    [if "name" in claims then claims.name else null]
;

{
  identity: {
    traits: {
      // Allowing unverified email addresses enables account
      // enumeration attacks,  if the value is used for
      // verification or as a password login identifier.
      //
      // If connecting only to your organization (one tenant), claims.email is safe to use
      // if you haven't actively disabled e-mail verification during sign-up.
      //
      // The email might be empty if the account isn't linked to an email address.
      // For a human readable identifier, consider using the "preferred_username" claim.
      [if std.objectHas(claims, "email") || std.objectHas(claims, "preferred_username") && claims.email_verified then "email" else null]: std.asciiLower(emailValue),
      name: std.join(" ", userNames)[:32],
    },
    verified_addresses: std.prune([
      // Carry over verified status from Social Sign-In provider.
      if std.objectHas(claims, "email") || std.objectHas(claims, "preferred_username") && claims.email_verified then { via: 'email', value: emailValue },
    ]),
  },
}