# Async Benchmark Runner
A benchmark runner for node focusing on measuring elapsed time and memory usage for promise using asynchronous code.
ABR is intended to be run as a part of a performance regression test suite.  It is not intended for microbenchmarking or load testing.

## Installing

`npm install --save-dev async-benchmark-runner`

## Benchmark Suite
A benchmark suite is an array of benchmark objects.

## Benchmarking challenges under v8
Javascript is a dynamic language.  V8 gathers information about code as it runs, attempting to apply optimizations where they will have the most impact and trying not to let the cost of optimizing to outweigh the gains.  This can make creating and interpreting benchmarks under node difficult.

## Measuring memory usage

## Building and Benchmarking your Application
Using ABR in a non-trivial context is likely to require significant work on your project's build tooling.  The benchmarks should be run against the final built version of your code.  Benchmarks should also be run with `NODE_ENV` set to `production`.  You may also have a specialized standard environment in which to run your benchmark suite.

Tooling such as `node-babel`, while helpful for developement will significantly impact benchmark results.  Thus, the benchmark suite should be run on the final built version of your code.  This also impacts the development of the benchmarks themselves.  If your benchmark code uses features that require tooling (such as es6), you will have to create a build process for the benchmarks, ensuring that a final build of the benchmarks run against the final build of the system under test.

The development of the benchmark suite itself can be more difficult than developing code in the system under test.  Tools that improve the interactiveity of the code-test cycle may skew benchmark results and should be considered carefully.

## Roadmap
