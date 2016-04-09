/* @flow */

/**
 * Left justify a value within a given length
 */
export function formatLeft(
  value: mixed,
  totalLength: number
): string {
  const str = String(value);
  if (str.length > totalLength) {
    return '*'.repeat(totalLength);
  }
  return str + ' '.repeat(totalLength - str.length);
}

/**
 * Right justify a value within a given length
 */
export function formatRight(
  value: mixed,
  totalLength: number
): string {
  const str = String(value);
  if (str.length > totalLength) {
    return '*'.repeat(totalLength);
  }
  return ' '.repeat(totalLength - str.length) + str;
}
