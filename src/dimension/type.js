/* @flow */

/**
 * Describe a measurement dimension
 */
export type Dimension<T> = {
  name: string;
  displayName: string;
  units: string;
  startMeasuring: () => T;
  stopMeasuring: (start: T) => number;
}
