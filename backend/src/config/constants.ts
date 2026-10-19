/**
 * Number of positive VERIFY confirmations a COMMUNITY_SUBMITTED spot needs
 * — with zero open REPORTs against it — before it's automatically
 * promoted to COMMUNITY_VERIFIED. Kept as a single constant so it's easy
 * to tune during the hackathon without hunting through service code.
 */
export const COMMUNITY_VERIFICATION_THRESHOLD = 3;
