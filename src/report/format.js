/* @flow */
/**
 * Left justify a value
 */
export function formatLeft(
  value: mixed,
  totalLength: number
): string {
  const str = String(value);
  if (str.length > totalLength) {
    return str.substring(0, totalLength);
  }
  return str + ' '.repeat(totalLength - str.length);
}

/**
 * Right justify a value
 */
export function formatRight(
  value: mixed,
  totalLength: number
): string {
  const str = String(value);
  if (str.length > totalLength) {
    return str.substring(0, totalLength);
  }
  return ' '.repeat(totalLength - str.length) + str;
}
