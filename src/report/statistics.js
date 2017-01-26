/* @flow */
import {
  mean,
  standardDeviation
} from 'simple-statistics';

import {
  confidenceIntervalForT
} from 'experiments.js';

/**
 * Calculate the margin of error for a set of samples
 */
export function marginOfError(samples: Array<number>) : number {
  const toPercent = 100;
  const confidenceLevel = 0.95;
  const sampleMean = mean(samples);
  const standardError = standardDeviation(samples) / Math.sqrt(samples.length);
  const degreesOfFreedom = samples.length - 1;
  const interval = confidenceIntervalForT(
    sampleMean,
    standardError,
    degreesOfFreedom,
    confidenceLevel
  );
  return (((interval[1] - sampleMean) / sampleMean) * toPercent) || 0;
}
