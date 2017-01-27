/* @flow */

import {
  setUpBenchmark,
  tearDownBenchmark
} from './sampler';

import type {
  Benchmark
} from './benchmark';

/**
 * Prevent variation by running each benchmark once, thus populating the
 * inline caches in the code under test with the full diversity of values
 * in the benchmark suite.  Reduces sensitivity to benchmark ordering by
 * preventing optimization and de-optimization cycles as v8 learns new
 * run time information while cycling through benchmarks.
 */
export function populateInlineCaches(benchmarkSuite: Array<Benchmark>) {
  const promises = [];
  for (let i = 0; i < benchmarkSuite.length; i++) {
    const benchmark = benchmarkSuite[i];
    const setUpErr = setUpBenchmark(benchmark);
    if (setUpErr) {
      promises.push(Promise.reject(setUpErr));
    }
    if (typeof benchmark.run === 'function') {
      benchmark.run();
      const tearDownErr = tearDownBenchmark(benchmark);
      if (tearDownErr) {
        promises.push(Promise.reject(tearDownErr));
      }
    } else if (typeof benchmark.startRunning === 'function') {
      promises.push(benchmark.startRunning().then(() => {
        const Err = tearDownBenchmark(benchmark);
        if (Err) {
          throw Err;
        }
      }));
    } else {
      throw Error(
        `"${benchmark.name} does not provide a run or startRunning function`
      );
    }
  }
  return Promise.all(promises);
}
