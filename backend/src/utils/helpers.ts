
// src/utils/helpers.ts
export function safeUser(u: any) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}
