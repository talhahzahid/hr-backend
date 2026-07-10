/** Full-year leave quotas (calendar year). */
export const LEAVE_QUOTAS = {
  Annual: 8,
  Casual: 8,
  Sick: 8,
};

/** Leave types that use balance tracking. */
export const BALANCED_LEAVE_TYPES = Object.keys(LEAVE_QUOTAS);
