/* @flow */

export {
  startBenchmarking
} from './runner';

export {
  runBenchmarkTest,
  startBenchmarkTest
} from './tester';

export {
  compareMemoryResults,
  compareTimeResults
} from './report/compare';

export {
  reportResult
} from './report/report';

export {
  TimeDimension
} from './dimension/time';

export {
  MemoryDimension
} from './dimension/memory';

export {
  DebugDimension
} from './dimension/debug';

