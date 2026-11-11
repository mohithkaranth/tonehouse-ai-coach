export function subscriptionGrantsAccess(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}
