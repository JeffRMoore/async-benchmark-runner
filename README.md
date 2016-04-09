# Async Benchmark Runner
A benchmark runner for node focusing on measuring elapsed time and memory usage for promise using asynchronous code.
ABR is intended to be run as a part of a performance regression test suite.  It is not intended for microbenchmarking or load testing.

## Installing

`npm install --save-dev async-benchmark-runner`

## Getting Started
Here is an example of the simplest possible benchmark suite:
```
export const benchmarkSuiteName = 'Simple Suite';

export const benchmarks = [
  {
    name: 'NO-OP Asynchronous',
    startRunning: () => {
      return Promise.resolve(false);
    }
  }
];
```
This creates a syncronous benchmark that does nothing.  Place this in a file in your project `called benchmarks/suite.js`.  (This can be changed.)

Run the benchmark suite via the cli utility:
```
./node_modules/.bin/run-benchmark
```

Here is the equivelent simplest possible Asynchronous benchmark:
```
export const benchmarkSuiteName = 'Simple Suite';

export const benchmarks = [
  {
    name: 'NO-OP Synchronous',
    run: () => {
      return false;
    }
  }
];
```
An asyncronous benchmark must return a promise.  The measurement interval will not be completed until that promise resolves.

## Benchmark Suite
A benchmark suite is an array of benchmark definition objects.  A benchmark definition is a simple javascript object.  Here is an example of the simplest possible benchmark suite.

There are two types of benchmark, one for synchronous benchmarks and one for asynchronous benchmarks.  Both types share the following fields:

| field | Description |
| --- | --- |
| name | The name of the benchmark for reporting purposes.  This is required.  It must also be unique within a benchmark suite. |
| setUp | An optional function which will be called prior to running the benchmark, outside of any measuring interval.  Use to initialize any data required during the benchmark run. |
| tearDown | An optional function which will be called after the benchmark has completed running, outside of any measuring interval.  Use to free resources to make them available for other benchmarks. |

## Benchmarking challenges under v8
Javascript is a dynamic language.  V8 gathers information about code as it runs, attempting to apply optimizations where they will have the most impact and trying not to let the cost of optimizing to outweigh the gains.  This can make creating and interpreting benchmarks under node difficult.

## Measuring memory usage

## Building and Benchmarking your Application
Using ABR in a non-trivial context is likely to require significant work on your project's build tooling.  The benchmarks should be run against the final built version of your code.  Benchmarks should also be run with `NODE_ENV` set to `production`.  You may also have a specialized standard environment in which to run your benchmark suite.

Tooling such as `node-babel`, while helpful for developement will significantly impact benchmark results.  Thus, the benchmark suite should be run on the final built version of your code.  This also impacts the development of the benchmarks themselves.  If your benchmark code uses features that require tooling (such as es6), you will have to create a build process for the benchmarks, ensuring that a final build of the benchmarks run against the final build of the system under test.

The development of the benchmark suite itself can be more difficult than developing code in the system under test.  Tools that improve the interactiveity of the code-test cycle may skew benchmark results and should be considered carefully.

## Roadmap / TODO

- fix --expose-gc parameter for linux shebang issue
- Update getting started docs
- Document running with ENV production
- Implement measurement event listener
- Help cli option
- split compare report into separate memory and time so change colummn can be added
- progress indicator
- opt-deopt debugger using event listener
- write tests for benchmarks
- use this for benchmark state
- don't hardcode opsPerSample
- Don't hardccode numSamples
- test for too much memory usage
- format should overflow with *
- document "quieting your environment"
- suite name should just export name
- write test cases
- add memory capture enabled indicator to results
- Add confidence level to non-compare reports
- rename benchmarks to benchmark
- refactor stats to isolate dependencies
- use destructuring for stats
- extract MOE test code to stats
