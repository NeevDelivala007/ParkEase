const ACTIVE_IDENTITY_KEY = "parkease_active_identity_id";

export function getStoredIdentityId(): string | null {
  return localStorage.getItem(ACTIVE_IDENTITY_KEY);
}

export function setStoredIdentityId(id: string): void {
  localStorage.setItem(ACTIVE_IDENTITY_KEY, id);
}

const GUEST_ADJECTIVES = ["Swift", "Steady", "Bright", "Quiet", "Keen", "Sharp"];
const GUEST_NOUNS = ["Driver", "Commuter", "Explorer", "Rider", "Navigator"];

/**
 * Generates a friendly display name + a unique-enough email so the backend
 * (which requires a unique email per user) can create a new demo identity
 * without any real signup. This is NOT authentication — there's no
 * password, no session, just an id used the same way `userId` is already
 * passed to the verify/report/book endpoints.
 */
export function generateGuestIdentity(): { name: string; email: string } {
  const adjective = GUEST_ADJECTIVES[Math.floor(Math.random() * GUEST_ADJECTIVES.length)];
  const noun = GUEST_NOUNS[Math.floor(Math.random() * GUEST_NOUNS.length)];
  const suffix = Math.random().toString(36).slice(2, 8);
  return {
    name: `${adjective} ${noun}`,
    email: `guest-${suffix}@parkease.local`,
  };
}
