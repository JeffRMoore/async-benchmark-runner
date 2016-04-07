import {
  formatLeft,
  formatRight
} from './format';
import type {
  BenchmarkSuiteResult
} from '../runner';
import {
  marginOfError
} from './statistics';
import {
  mean
} from 'simple-statistics';

/**
 *
 */
export function reportResult(
  benchmarkResult: BenchmarkSuiteResult,
  outputFn
) {
  const marginOfErrorSize = 3;
  const marginOfErrorUnits = '%';
  const marginOfErrorPrefix = '±';
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
  benchmarkResult.results.forEach(result => {
    const time = Math.round(mean(result.timingSamples));
    const timeMoe = Math.round(marginOfError(result.timingSamples));
    const memory = Math.round(mean(result.memorySamples));
    const memoryMoe = Math.round(marginOfError(result.memorySamples));
    const benchmarkColumn =
      formatLeft(result.name, benchmarkColumnSize);
    const timeColumn =
      formatRight(time, timeSize) +
      timeUnits +
      marginOfErrorPrefix +
      formatRight(timeMoe, marginOfErrorSize) +
      marginOfErrorUnits;
    const memoryColumn =
      formatRight(memory, memorySize) +
      memoryUnits +
      marginOfErrorPrefix +
      formatRight(memoryMoe, marginOfErrorSize) +
      marginOfErrorUnits;
    outputFn(benchmarkColumn, timeColumn, memoryColumn);
  });
}
