function(ctx) {
  identity: {
    id: ctx.identity.id,
    created_at: ctx.identity.created_at,
    updated_at: ctx.identity.updated_at,
    traits: ctx.identity.traits + { loginService: "EMAIL_PASSWORD" },
    is_verified: false,
  },
  flow: {
    id: ctx.flow.id,
    [if "transient_payload" in ctx.flow then "transient_payload" else null]: ctx.flow.transient_payload,
  }
}
