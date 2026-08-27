function safeError(error) {
  return {
    name: typeof error?.name === "string" ? error.name.slice(0, 80) : "Error",
    code:
      typeof error?.code === "string" || typeof error?.code === "number"
        ? String(error.code).slice(0, 80)
        : undefined,
  };
}

export function logServerError(context, error) {
  // Do not serialize complete database/OAuth errors: connection strings,
  // provider responses and tokens can be embedded in their messages/stacks.
  console.error(context, safeError(error));
}
