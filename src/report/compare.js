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

/**
 * Compare the results of two benchmarks, outputting the differences based
 * on statistical significance.
 */
export function compareResults(
  result1: BenchmarkSuiteResult,
  result2: BenchmarkSuiteResult,
  outputFn
) {
  const marginOfErrorSize = 3;
  const marginOfErrorUnits = '%';
  const marginOfErrorPrefix = ' ±';
  const timeSize = 7;
  const timeUnits = ' ns';
  const memorySize = 9;
  const memoryUnits = ' b';
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
  const significanceThreshold = 0.05;
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
    formatLeft('Benchmark', benchmarkColumnSize),
    formatRight('Time', timeColumnSize),
    formatRight('Memory', memoryColumnSize)
  );
  outputFn(
    '-'.repeat(benchmarkColumnSize),
    '-'.repeat(timeColumnSize),
    '-'.repeat(memoryColumnSize)
  );
  for (let i = 0; i < baseResult.results.length; i++) {
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

    let timeColumn;
    if (time.probabilityLevel < significanceThreshold) {
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

    let memoryColumn;
    if (memory.probabilityLevel < significanceThreshold) {
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

    outputFn(benchmarkColumn, timeColumn, memoryColumn);

  }
}
