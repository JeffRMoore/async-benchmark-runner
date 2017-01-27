/* @flow */

import flatten from 'lodash.flatten';

import type {
  Benchmark
} from './benchmark';

import type {
  DimensionList
} from './dimension/type';

import {
  collectSynchronousSample,
  collectAsynchronousSample,
  setUpBenchmark,
  tearDownBenchmark
} from './sampler';

/**
 * A set of sample measurements
 */
export type Samples = Array<number>;

/**
 * Result of running one benchmark
 */
export type BenchmarkResult =
{
  name: string;
  isAsynchronous: boolean;
  opsPerSample: number;
  numSamples: number;
  samples: { [measurementName: string] : Samples };
}

/**
 * Result of running a suite of benchmarks
 */
export type BenchmarkSuiteResult =
{
  name: string;
  startTime: number;
  dimensions: Array<string>;
  results: Array<BenchmarkResult>;
}

type resolveFn = (value: any) => void;

type rejectFn = (value: any) => void;

let dimensions: DimensionList = [];

/**
 * Start the process of running a suite of benchmarks
 */
export function startBenchmarking(
  name: string,
  benchmarkSuite: Array<Benchmark>,
  dimensionList: DimensionList
) : Promise<*> {
  dimensions = dimensionList;
  return new Promise((resolve: resolveFn, reject: rejectFn) => {
    const suiteResult : BenchmarkSuiteResult = {
      name,
      startTime: Date.now(),
      dimensions: dimensions.map(dimension => dimension.name),
      results: []
    };
    const suite = flatten(benchmarkSuite);

    // impedance mismatch between async styles
    populateInlineCaches(suite).then(() => {
      scheduleNextBenchmark(resolve, reject, suite, suiteResult);
    });
  });
}

/**
 * Prevent variation by running each benchmark once, thus populating the
 * inline caches in the code under test with the full diversity of values
 * in the benchmark suite.  Reduces sensitivity to benchmark ordering by
 * preventing optimization and de-optimization cycles as v8 learns new
 * run time information while cycling through benchmarks.
 */
function populateInlineCaches(benchmarkSuite: Array<Benchmark>) {
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

/**
 * Schedule a benchmark to be run at a later time
 */
function scheduleNextBenchmark(
  resolve: resolveFn,
  reject: rejectFn,
  benchmarkSuite: Array<Benchmark>,
  suiteResult: BenchmarkSuiteResult
) : void {
  setImmediate(runBenchmark, resolve, reject, benchmarkSuite, suiteResult);
}

/**
 * Start the process of running a single benchmark
 */
function runBenchmark(
  resolve: resolveFn,
  reject: rejectFn,
  benchmarkSuite: Array<Benchmark>,
  suiteResult: BenchmarkSuiteResult
) : void {
  const benchmark: Benchmark = benchmarkSuite.shift();

  // if there are no more benchmarks, stop
  if (!benchmark) {
    resolve(suiteResult);
    return;
  }

  if (!benchmark.name) {
    reject(new Error(
    `"${benchmark.name} does not provide a name`
    ));
    return;
  }

  /* eslint no-unneeded-ternary:0 */
  const initialResult:BenchmarkResult = {
    name: benchmark.name,
    isAsynchronous: benchmark.startRunning ? true : false,
    opsPerSample: 1000,
    numSamples: 100,
    samples: dimensions.reduce((samples, dimension) => {
      samples[dimension.name] = [];
      return samples;
    }, Object.create(null))
  };

  const resolveBenchmark = (finalResult: BenchmarkResult) => {
    suiteResult.results.push(finalResult);
    scheduleNextBenchmark(resolve, reject, benchmarkSuite, suiteResult);
  };

  scheduleNextSample(resolveBenchmark, reject, benchmark, initialResult);
}

/**
 * Schedule sample collection
 */
function scheduleNextSample(
  resolve: resolveFn,
  reject: rejectFn,
  benchmark: Benchmark,
  result: BenchmarkResult
): void {
  if (isSamplingComplete(result)) {
    resolve(result);
    return;
  }
  if (benchmark.run) {
    setImmediate(
      collectSynchronousSample,
      benchmark,
      dimensions,
      result.opsPerSample,
      (finalMeasurements) => {
        recordMeasurements(result, finalMeasurements);
        scheduleNextSample(resolve, reject, benchmark, result);
      },
      reject
    );
  } else if (benchmark.startRunning) {
    setImmediate(
      collectAsynchronousSample,
      benchmark,
      dimensions,
      result.opsPerSample,
      (finalMeasurements) => {
        recordMeasurements(result, finalMeasurements);
        scheduleNextSample(resolve, reject, benchmark, result);
      },
      reject
    );
  } else {
    reject(new Error(
    `"${benchmark.name} does not provide a run or startRunning function`
    ));
  }
}

/**
 * Does the result contain all required samples?
 */
function isSamplingComplete(result: BenchmarkResult) {
  return result.samples.time.length >= result.numSamples;
}

/**
 * Record the measurements from a set of dimensions
 */
function recordMeasurements(
  result: BenchmarkResult,
  finalMeasurements: Array<number>
): void {
  for (let i = 0; i < dimensions.length; i++) {
    result.samples[dimensions[i].name].push(
      Math.round(finalMeasurements[i] / result.opsPerSample)
    );
  }
}
