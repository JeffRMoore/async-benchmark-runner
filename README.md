# Async Benchmark Runner
A benchmark runner for node focusing on measuring elapsed time and memory usage
for promise using asynchronous code. ABR is intended to be run as a part of a
performance regression test suite.  It is not intended for microbenchmarking or
load testing.

## Installing

```
npm install --save-dev async-benchmark-runner
```

## Getting Started
Here is an example of the simplest possible benchmark suite:
```
exports.name = 'Simple Suite';

exports.benchmarks = [
  {
    name: 'NO-OP Synchronous',
    run: () => {
      return false;
    }
  }
];
```
This creates a synchronous benchmark that does nothing.  Place this in a file in
your project called `benchmarks/suite.js`.  

Run the benchmark suite via the cli utility:
```
./node_modules/.bin/run-benchmark
```

The results will be saved to a unique json file in the `benchmark-results`
folder.  The result location can be changed with a `--result-dir` parameter.
This location can be changed by specifying an alternate location with 
via the `--suite` parameter.

A result report will be output:

```
Running benchmark suite from benchmark/suite
A Benchmark                                             Time             Memory
- ---------------------------------------- ----------------- ------------------
  NO-OP Synchronous                              13 ns ± 10%          2 b ±  3%
Writing results to benchmark-results/1460241638054-benchmark.json
```
Benchmark times are displayed in nanoseconds which is the unit of measure for
node's [high resolution  timer](https://nodejs.org/api/process.html#process_process_hrtime).
Memory is displayed in bytes.  The percentage indicates a [margin of error](https://en.wikipedia.org/wiki/Margin_of_error)
calculated from a default [confidence level](https://en.wikipedia.org/wiki/Confidence_interval) of 0.95.
This represents observed variation in timing, but cannot account for errors in
benchmark design or environment setup.

Here is the equivelent simplest possible asynchronous benchmark:
```
exports.name = 'Simple Suite';

exports.benchmarks = [
  {
    name: 'NO-OP Asynchronous',
    startRunning: () => {
      return Promise.resolve(false);
    }
  }
];
```
An asynchronous benchmark must return a promise.  The measurement interval will 
not be completed until that promise resolves.

The results of running this benchmark will look like this:

```
Running benchmark suite from benchmark/suite
A Benchmark                                             Time             Memory
- ---------------------------------------- ----------------- ------------------
* NO-OP Asynchronous                           1194 ns ±  5%       1908 b ±  1%
Writing results to benchmark-results/1460240762239-benchmark.json
```

Asynchronous benchmark names will be prefixed by an asterisk in the 
result report.

## Creating a Quiet Environment for Running Benchmarks
Comparing different runs of the same benchmark requires that the conditions
under which each are run to be similiar.  You will acheive better results if you
eliminate and exit any extranious programs on the machine you are running your
tests on.  Joe Bob's animated GIF storm in Slack may be amusing, but you do not
want it to throw off your benchmarks.  To check your environment, 
run the same benchmark suite twice
```
./node_modules/.bin/run-benchmark
./node_modules/.bin/run-benchmark
```

The analyze-benchmark tool will automatically compare the last two benchmark 
results.  It tests the statistical signficance of the two sets of results
and will only show results from benchmarks that are significantly different.

We can use this to measure environmental variation because two runs of
the same benchmark should not be signficantly different.

The default significance threshold is 5% (p < 0.05) and indicates less than
5% chance of false significance.  To increase the sensativity of our
test of our environment we increase the statisitical signficance threshold
to 50% via the `--signficance-threshold` parameter.

```
./node_modules/.bin/analyze-benchmark --significance-threshold=0.50
```
analyze-benchmark should report no significant difference between the runs,
even at the weaker significance level.  Here is an example report showing
no significant difference:

```
TODO: example results here
```
If a difference is reported, look for ways to reduce the variation in your 
environment.  Here is an example report from a noisy environment.
```
TODO: example results here
```

## Comparing Benchmark Runs

As seen in the last section the analyze-benchmark command can compare the 
last two benchmark runs.  It can also be given explicit paths to two
benchmark data files.
```
./node_modules/.bin/analyze-benchmark 1-benchmark.json 2-benchmark.json
```
The order of the parameters do not matter, the comparison report always
treats the older run as the baseline result and the newer run as the
result under test.

### Comparing two branches

Here is an example series of commands to compare two branches.
```
git checkout master
./node_modules/.bin/run-benchmark
./node_modules/.bin/run-benchmark
```
Switch to the master branch and take a baseline result.

```
./node_modules/.bin/analyze-benchmark --significance-threshold=0.50
```
Check the current environment

```
git checkout feature-branch
./node_modules/.bin/run-benchmark
```
Take a result for the branch to be tested.

```
./node_modules/.bin/analyze-benchmark
```
compare the two.

### Comparing work in progress

Here is an example of benchmarking work which is not yet checked in.
```
git stash
./node_modules/.bin/run-benchmark
./node_modules/.bin/run-benchmark
```
Stash away pending changes and take a baseline result.

```
./node_modules/.bin/analyze-benchmark --significance-threshold=0.50
```
Check the current environment

```
git apply
./node_modules/.bin/run-benchmark
```
Bring back the pending work and take a result for the branch to be tested.
```
./node_modules/.bin/analyze-benchmark
```
compare the results.

### Comparing current work against a prior tagged release

Here is an example of benchmarking new work against a tagged prior release.
```
git checkout -b v2benchmark v2.0.0
./node_modules/.bin/run-benchmark
./node_modules/.bin/run-benchmark
```
Create a new branch based on a prior version and take a baseline result.

```
./node_modules/.bin/analyze-benchmark --significance-threshold=0.50
```
Check the current environment

```
git checkout master
./node_modules/.bin/run-benchmark
```
Test master against the prior release.
```
./node_modules/.bin/analyze-benchmark
```
compare the results.

```
git branch -d v2benchmark
```
Clean up the temporary branch when done.

## Authoring a Benchmark Suite
A benchmark suite is an array of benchmark definition objects.  A benchmark
definition is a simple javascript object.  Here is an example of the simplest
possible benchmark suite.

There are two types of benchmark, one for synchronous benchmarks and one for
asynchronous benchmarks.  Both types share the following fields:

| field | Description |
| --- | --- |
| name | The name of the benchmark for reporting purposes.  This is required.  It must also be unique within a benchmark suite. |
| setUp | An optional function which will be called prior to running the benchmark, outside of any measuring interval.  Use to initialize any data required during the benchmark run. |
| tearDown | An optional function which will be called after the benchmark has completed running, outside of any measuring interval.  Use to free resources to make them available for other benchmarks. |

### Benchmarking overhead

## Benchmarking challenges under v8
Javascript is a dynamic language.  V8 gathers information about code as it runs,
attempting to apply optimizations where they will have the most impact and 
trying not to let the cost of optimizing to outweigh the gains.  This can make
creating and interpreting benchmarks under node difficult.

## Measuring Memory Usage

## Building and Benchmarking your Application
Using ABR in a non-trivial context is likely to require significant work on your 
project's build tooling.  The benchmarks should be run against the final built 
version of your code.  Benchmarks should also be run with `NODE_ENV` set to 
`production`.  You may also have a specialized standard environment in which
to run your benchmark suite.

Tooling such as `node-babel`, while helpful for developement will significantly
impact benchmark results.  Thus, the benchmark suite should be run on the final
built version of your code.  This also impacts the development of the benchmarks 
themselves.  If your benchmark code uses features that require tooling (such as 
es6), you will have to create a build process for the benchmarks, ensuring that 
a final build of the benchmarks run against the final build of the system under 
test.

The development of the benchmark suite itself can be more difficult than 
developing code in the system under test.  Tools that improve the interactivity
 of the code-test cycle may skew benchmark results and should be considered 
 carefully.

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
- document "quieting your environment"
- write test cases
- add memory capture enabled indicator to results
- Add confidence level to non-compare reports
- refactor stats to isolate dependencies
- use destructuring for stats
- extract MOE test code to stats
