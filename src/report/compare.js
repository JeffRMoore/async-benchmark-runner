/* @flow */
import {
  formatLeft,
  formatRight
} from './format';
import type {
  BenchmarkSuiteResult
} from '../runner';
import {
  tTest
} from 'experiments.js';

const defaultSignificanceThreshold = 0.05;

/**
 * Compare the results of two benchmarks, outputting the differences based
 * on statistical significance.
 */
export function compareResults(
  result1: BenchmarkSuiteResult,
  result2: BenchmarkSuiteResult,
  outputFn: (...x: any) => void,
  significanceThreshold: number = defaultSignificanceThreshold
): void {
  const marginOfErrorSize = 3;
  const marginOfErrorUnits = '%';
  const marginOfErrorPrefix = ' ±';
  const timeSize = 8;
  const timeUnits = ' ns';
  const memorySize = 10;
  const memoryUnits = ' b';
  const asyncColumnSize = 1;
  const benchmarkColumnSize = 40;
  const timeColumnSize =
    timeSize +
    timeUnits.length +
    marginOfErrorPrefix.length +
    marginOfErrorSize +
    marginOfErrorUnits.length;
  const memoryColumnSize =
    memorySize +
    memoryUnits.length +
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
    formatRight('Memory', memoryColumnSize)
  );
  outputFn(
    '-'.repeat(asyncColumnSize),
    '-'.repeat(benchmarkColumnSize),
    '-'.repeat(timeColumnSize),
    '-'.repeat(memoryColumnSize)
  );

  let insignificantBenchmarks = 0;
  for (let i = 0; i < baseResult.results.length; i++) {
    const asyncColumn =
      formatLeft(baseResult.results[i].isAsynchronous ? '*' : '', asyncColumnSize);
    const benchmarkColumn = formatLeft(
      baseResult.results[i].name, benchmarkColumnSize
    );

    const time = tTest(
      baseResult.results[i].timingSamples,
      testResult.results[i].timingSamples
    );
    const memory = tTest(
      baseResult.results[i].memorySamples,
      testResult.results[i].memorySamples
    );

    const isTimeSignificant = time.probabilityLevel < significanceThreshold;
    let timeColumn;
    if (isTimeSignificant) {
      const timeDifference = Math.round(time.meanDifference);
      const timeMarginOfError =
        (time.confidenceInterval[1] - time.meanDifference) /
        time.meanDifference * toPercent ||
        0;
      timeColumn =
        formatRight(timeDifference, timeSize) +
        timeUnits +
        marginOfErrorPrefix +
        formatRight(Math.round(timeMarginOfError), marginOfErrorSize) +
        marginOfErrorUnits;
    } else {
      timeColumn = formatRight('', timeColumnSize);
    }

    const isMemorySignificant =
      memory.probabilityLevel < significanceThreshold;
    let memoryColumn;
    if (isMemorySignificant) {
      const memoryDifference = Math.round(memory.meanDifference);
      const memoryMarginOfError =
        (memory.confidenceInterval[1] - memory.meanDifference) /
        memory.meanDifference * toPercent ||
        0;
      memoryColumn =
        formatRight(memoryDifference, memorySize) +
        memoryUnits +
        marginOfErrorPrefix +
        formatRight(Math.round(memoryMarginOfError), marginOfErrorSize) +
        marginOfErrorUnits;
    } else {
      memoryColumn = formatRight('', memoryColumnSize);
    }

    if (isTimeSignificant || isMemorySignificant) {
      outputFn(asyncColumn, benchmarkColumn, timeColumn, memoryColumn);
    } else {
      insignificantBenchmarks += 1;
    }

  }

  if (insignificantBenchmarks > 0) {
    outputFn(
      `  ${insignificantBenchmarks} benchmarks not significantly different ` +
      `(p > ${significanceThreshold})`
      );
  }
}
