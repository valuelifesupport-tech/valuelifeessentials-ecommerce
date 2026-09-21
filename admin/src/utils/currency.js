/**
 * Currency conversion and numeric input utilities.
 */

const DEFAULT_RATE = 95;

/** Convert INR value to USD. Returns '' for empty/zero. */
export function convertInrToUsd(val, rate = DEFAULT_RATE) {
  if (val === '' || val === null || val === undefined) return '';
  const num = Number(val);
  return num > 0 ? Number((num / rate).toFixed(2)) : '';
}

/** Format number as Indian currency string (e.g. 1,234.56). */
export function formatInr(val) {
  const num = Number(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Sanitize numeric input value — returns '' or Math.max(0, Number(val)). */
export function sanitizeNumericInput(rawValue) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return '';
  return Math.max(0, Number(rawValue));
}
