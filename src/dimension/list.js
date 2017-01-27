/* @flow */

import type {
  Dimension
} from './type';

/**
 * A list of dimensions to measure
 */
export type DimensionList = Array<Dimension<*>>;

/**
 * A list of measurements corresponding to a list of dimensions
 */
export type Measurements = Array<number>;

/**
 * Start measuring all requested dimensions in order
 * @param dimensions The dimensions to start measuring
 */
export function startMeasuring(dimensions: DimensionList): Measurements {
  const startingMeasurements = new Array(dimensions.length);
  for (let i = 0; i < dimensions.length; i++) {
    startingMeasurements[i] = dimensions[i].startMeasuring();
  }
  return startingMeasurements;
}

/**
 * Take the final measurement of all requested dimensions in the reverse order
 * from which they were started.
 *
 * Receives a pre-allocated array to prevent need to allocate memory in this
 * function.
 *
 * @param dimensions The dimensions to stop measuring
 * @param startingMeasurements A list of starting measurement for each dimension
 * @param endingMeasurements A pre-allocated Array to record ending measuremsnts into
 * @returns endingMeasurements
 */
export function stopMeasuring(
  dimensions: DimensionList,
  startingMeasurements: Measurements,
  endingMeasurements: Measurements
): Measurements {
  for (let i = dimensions.length - 1; i >= 0; i--) {
    endingMeasurements[i] =
      dimensions[i].stopMeasuring(startingMeasurements[i]);
  }
  return endingMeasurements;
}
