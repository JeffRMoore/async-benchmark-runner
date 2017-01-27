/* @flow */

import {
  collectSynchronousSample,
  collectAsynchronousSample,
} from '../sampler';

import type {
  Benchmark,
  BenchmarkResult,
  BenchmarkSuiteResult
} from '../benchmark';

import type {
  DimensionList
} from '../dimension/list';

type resolveFn = (value: any) => void;

type rejectFn = (value: any) => void;

let dimensions: DimensionList = [];

export function setDimensionList(dim: DimensionList) {
  dimensions = dim;
}

/**
 * Schedule a benchmark to be run at a later time
 */
export function scheduleNextBenchmark(
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
