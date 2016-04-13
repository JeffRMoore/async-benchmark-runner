/* @flow */
import {
  formatLeft,
  formatRight
} from './format';
import type {
  BenchmarkSuiteResult
} from '../runner';
import {
  mean
} from 'simple-statistics';
import {
  tTest
} from 'experiments.js';

const defaultSignificanceThreshold = 0.05;
const defaultConfidenceLevel = 0.95;

/**
 * Compare the results of two benchmarks, outputting the differences based
 * on statistical significance.
 */
export function compareMemoryResults(
  result1: BenchmarkSuiteResult,
  result2: BenchmarkSuiteResult,
  outputFn: (...x: any) => void,
  significanceThreshold: number = defaultSignificanceThreshold,
  confidenceLevel: number = defaultConfidenceLevel
): void {
  const marginOfErrorSize = 3;
  const marginOfErrorUnits = '%';
  const marginOfErrorPrefix = ' ±';
  const memorySize = 10;
  const memoryUnits = ' b';
  const changeSize = 5;
  const changeUnits = '%';
  const asyncColumnSize = 1;
  const benchmarkColumnSize = 40;
  const memoryColumnSize =
    memorySize +
    memoryUnits.length;
  const changeColumnSize =
    changeSize +
    changeUnits.length +
    marginOfErrorPrefix.length +
    marginOfErrorSize +
    marginOfErrorUnits.length;
  const toPercent = 100;

  // Sort the input results into a base result (before) and
  // test result (after)
  let baseResult;
  let testResult;
  if (result1.startTime > result2.startTime) {
    baseResult = result2;
    testResult = result1;
  } else {
    baseResult = result1;
    testResult = result2;
  }

  outputFn(
    formatLeft('A', asyncColumnSize),
    formatLeft('Benchmark', benchmarkColumnSize),
    formatRight('Memory', memoryColumnSize),
    formatRight('Change', changeColumnSize)
  );
  outputFn(
    '-'.repeat(asyncColumnSize),
    '-'.repeat(benchmarkColumnSize),
    '-'.repeat(memoryColumnSize),
    '-'.repeat(changeColumnSize)
  );

  let insignificantBenchmarks = 0;
  for (let i = 0; i < baseResult.results.length; i++) {
    const memory = tTest(
      baseResult.results[i].memorySamples,
      testResult.results[i].memorySamples,
      confidenceLevel
    );

    if (memory.probabilityLevel > significanceThreshold) {
      insignificantBenchmarks += 1;
      continue;
    }

    const asyncColumn =
      formatLeft(baseResult.results[i].isAsynchronous ? '*' : '', asyncColumnSize);
    const benchmarkColumn = formatLeft(
      baseResult.results[i].name, benchmarkColumnSize
    );
    const memoryDifference = Math.round(memory.meanDifference);
    const memoryColumn =
      formatRight(memoryDifference, memorySize) +
      memoryUnits;
    const baseMean = mean(baseResult.results[i].timingSamples);
    const change = Math.round(memory.meanDifference * toPercent / baseMean);
    const interval = memory.confidenceInterval[1] - memory.meanDifference;
    const marginOfError = Math.round(interval * toPercent / baseMean);
    const changeColumn =
      formatRight(change, changeSize) +
      changeUnits +
      marginOfErrorPrefix +
      formatRight(marginOfError, marginOfErrorSize) +
      marginOfErrorUnits;

    outputFn(asyncColumn, benchmarkColumn, memoryColumn, changeColumn);

  }

  if (insignificantBenchmarks > 0) {
    outputFn(
      `  ${insignificantBenchmarks} benchmarks not different ` +
      `(p > ${significanceThreshold})`
      );
  }
}

/**
 * Compare the results of two benchmarks, outputting the differences based
 * on statistical significance.
 */
export function compareTimeResults(
  result1: BenchmarkSuiteResult,
  result2: BenchmarkSuiteResult,
  outputFn: (...x: any) => void,
  significanceThreshold: number = defaultSignificanceThreshold,
  confidenceLevel: number = defaultConfidenceLevel
): void {
  const marginOfErrorSize = 3;
  const marginOfErrorUnits = '%';
  const marginOfErrorPrefix = ' ±';
  const timeSize = 8;
  const timeUnits = ' ns';
  const changeSize = 5;
  const changeUnits = '%';
  const asyncColumnSize = 1;
  const benchmarkColumnSize = 40;
  const timeColumnSize =
    timeSize +
    timeUnits.length;
  const changeColumnSize =
    changeSize +
    changeUnits.length +
    marginOfErrorPrefix.length +
    marginOfErrorSize +
    marginOfErrorUnits.length;
  const toPercent = 100;

  // Sort the input results into a base result (before) and
  // test result (after)
  let baseResult;
  let testResult;
  if (result1.startTime > result2.startTime) {
    baseResult = result2;
    testResult = result1;
  } else {
    baseResult = result1;
    testResult = result2;
  }

  outputFn(
    formatLeft('A', asyncColumnSize),
    formatLeft('Benchmark', benchmarkColumnSize),
    formatRight('Time', timeColumnSize),
    formatRight('Change', changeColumnSize)
  );
  outputFn(
    '-'.repeat(asyncColumnSize),
    '-'.repeat(benchmarkColumnSize),
    '-'.repeat(timeColumnSize),
    '-'.repeat(changeColumnSize)
  );

  let insignificantBenchmarks = 0;
  for (let i = 0; i < baseResult.results.length; i++) {

    const time = tTest(
      baseResult.results[i].timingSamples,
      testResult.results[i].timingSamples,
      confidenceLevel
    );

    if (time.probabilityLevel > significanceThreshold) {
      insignificantBenchmarks += 1;
      continue;
    }

    const asyncColumn =
      formatLeft(baseResult.results[i].isAsynchronous ? '*' : '', asyncColumnSize);
    const benchmarkColumn = formatLeft(
      baseResult.results[i].name, benchmarkColumnSize
    );
    const timeDifference = Math.round(time.meanDifference);
    const timeColumn =
      formatRight(timeDifference, timeSize) +
      timeUnits;
    const baseMean = mean(baseResult.results[i].timingSamples);
    const change = Math.round(time.meanDifference * toPercent / baseMean);
    const interval = time.confidenceInterval[1] - time.meanDifference;
    const marginOfError = Math.round(interval * toPercent / baseMean);
    const changeColumn =
      formatRight(change, changeSize) +
      changeUnits +
      marginOfErrorPrefix +
      formatRight(marginOfError, marginOfErrorSize) +
      marginOfErrorUnits;

    outputFn(asyncColumn, benchmarkColumn, timeColumn, changeColumn);
  }

  if (insignificantBenchmarks > 0) {
    outputFn(
      `  ${insignificantBenchmarks} benchmarks not different ` +
      `(p > ${significanceThreshold})`
      );
  }
}
