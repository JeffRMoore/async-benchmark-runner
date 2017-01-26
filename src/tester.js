/* @flow */

import type {
  Benchmark
} from './runner';

import flatten from 'lodash.flatten';


/**
 * Find a benchmark matching a given name
 */
function findBenchmark(
  suite: Array<Benchmark>,
  name: string
): ?Benchmark {
  return suite.find(benchmark => benchmark.name === name);
}

/**
 * Run a benchmark specified by name from the suite, returning
 * the value returned by calling run.
 */
export function runBenchmarkTest(
  suite: Array<Benchmark>,
  name: string
) : any {

  const benchmark = findBenchmark(flatten(suite), name);
  if (!benchmark) {
    throw new Error(`Benchmark not found "${name}"`);
  }

  if (benchmark.setUp) {
    benchmark.setUp();
  }

  if (typeof benchmark.run !== 'function') {
    throw new Error(`Benchmark "${name}" does not define a run function`);
  }

  const result = benchmark.run();

  if (benchmark.tearDown) {
    benchmark.tearDown();
  }

  return result;
}

/**
 * Run a benchmark specified by name from the suite, returning
 * the value returned by calling run.
 */
export function startBenchmarkTest(
  suite: Array<Benchmark>,
  name: string
) : Promise<*> {
  const benchmark = findBenchmark(flatten(suite), name);
  if (!benchmark) {
    throw new Error(`Benchmark not found "${name}"`);
  }

  if (benchmark.setUp) {
    benchmark.setUp();
  }

  if (typeof benchmark.startRunning !== 'function') {
    throw new Error(`Benchmark "${name}" does not define a startRunning function`);
  }

  return benchmark.startRunning().then(result => {
    if (benchmark.tearDown) {
      benchmark.tearDown();
    }
    return result;
  });
}
