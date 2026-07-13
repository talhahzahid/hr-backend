/**
 * Build inclusive calendar month range.
 * month: 1-12, year: full year (e.g. 2026)
 */
export const getMonthRange = (month, year) => {
  const m = Number(month);
  const y = Number(year);

  if (!Number.isInteger(m) || m < 1 || m > 12) {
    const error = new Error("Month must be a number between 1 and 12");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(y) || y < 2000 || y > 2100) {
    const error = new Error("Year must be a valid number");
    error.statusCode = 400;
    throw error;
  }

  const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const endDate = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  // Next month start (exclusive upper bound) — safe for DATE and TIMESTAMP columns
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  const nextMonthStart = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return {
    month: m,
    year: y,
    startDate,
    endDate,
    nextMonthStart,
  };
};

export const resolveMonthYear = (month, year) => {
  const now = new Date();
  const resolvedYear = year !== undefined && year !== null && year !== ""
    ? Number(year)
    : now.getFullYear();
  const resolvedMonth = month !== undefined && month !== null && month !== ""
    ? Number(month)
    : now.getMonth() + 1;

  return getMonthRange(resolvedMonth, resolvedYear);
};
