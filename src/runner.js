/* @flow */

import flatten from 'lodash.flatten';

import type {
  Benchmark,
  BenchmarkSuiteResult
} from './benchmark';

import type {
  DimensionList
} from './dimension/list';

import {
  setDimensionList,
  scheduleNextBenchmark
} from './scheduler/legacy';

import {
  populateInlineCaches
} from './warmer';

/**
 * Start the process of running a suite of benchmarks
 */
export function startBenchmarking(
  name: string,
  benchmarkSuite: Array<Benchmark>,
  dimensionList: DimensionList
): Promise<*> {
  setDimensionList(dimensionList);
  return new Promise((resolve, reject) => {
    const suiteResult : BenchmarkSuiteResult = {
      name,
      startTime: Date.now(),
      dimensions: dimensionList.map(dimension => dimension.name),
      results: []
    };
    const suite = flatten(benchmarkSuite);

    // impedance mismatch between async styles
    populateInlineCaches(suite).then(() => {
      scheduleNextBenchmark(resolve, reject, suite, suiteResult);
    });
  });
}
