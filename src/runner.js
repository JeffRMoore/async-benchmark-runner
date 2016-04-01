import flatten from 'lodash.flatten';

/**
 * Describe a synchronous benchmark
 */
export type SynchronousBenchmark =
{
  name: string;
  setUp?: () => void;
  tearDown?: () => void;
  run: () => mixed;
}

/**
 * Describe an asynchronous benchmark
 */
export type ASynchronousBenchmark =
{
  name: string;
  setUp?: () => void;
  tearDown?: () => void;
  startRunning : () => Promise;
}

/**
 * Supported benchmarking styles
 */
export type Benchmark = SynchronousBenchmark | ASynchronousBenchmark;

/**
 * Result of running one benchmark
 */
export type BenchmarkResult =
{
  name: string;
  opsPerSample: number;
  numSamples: number;
  timingSamples: Array<number>;
  memorySamples: Array<number>;
}

/**
 * Options controlling how benchmarks are run
 */
export type BenchmarkingOptions =
{
}

/**
 * Result of running a suite of benchmarks
 */
export type BenchmarkSuiteResult =
{
  name: string;
  options: BenchmarkingOptions;
  startTime: Array<number>;
  results: Array<BenchmarkResult>;
}

/**
 * Start the process of running a suite of benchmarks
 */
export function startBenchmarking(
  name: String,
  benchmarkSuite: Array<Benchmark>,
  options: BenchmarkingOptions
) : Promise {
  return new Promise((resolve: resolveFn, reject: rejectFn) => {
    const suiteResult : BenchmarkSuiteResult = {
      name,
      options,
      startTime: Date.now(),
      results: []
    };
    if (!global.gc) {
      reject(new Error('Benchmarks must be run with --expose-gc node option'));
    } else {
      scheduleNextBenchmark(resolve, reject, flatten(benchmarkSuite), suiteResult);
    }
  });
}

type resolveFn = (value:mixed) => void;

type rejectFn = (value:mixed) => void;

/**
 * Schedule a benchmark to be run at a later time
 */
function scheduleNextBenchmark(
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

  const benchmark = benchmarkSuite.shift();

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

  const initialResult:BenchmarkResult = {
    name: benchmark.name,
    opsPerSample: 1000,
    numSamples: 100,
    timingSamples: [],
    memorySamples: []
  };

  const Err = setupBenchmark(benchmark);
  if (Err) {
    reject(Err);
    return;
  }

  const resolveBenchmark = (finalResult: BenchmarkResult) => {
    suiteResult.results.push(finalResult);
    scheduleNextBenchmark(resolve, reject, benchmarkSuite, suiteResult);
  };

  scheduleNextSample(resolveBenchmark, reject, benchmark, initialResult);
}

/**
 *  Setup benchmark resources before running
 */
function setupBenchmark(benchmark: Benchmark): Error | false {
  if (benchmark.setUp) {
    try {
      benchmark.setUp();
    } catch (e) {
      return e;
    }
  }
  return false;
}

/**
 * Schedule sample collection
 */
function scheduleNextSample(
  resolve: resolveFn,
  reject: rejectFn,
  benchmark: ASynchronousBenchmark,
  result: BenchmarkResult
): void {
  if (isSamplingComplete(result)) {
    const Err = tearDownBenchmark(benchmark);
    if (Err) {
      reject(Err);
    } else {
      resolve(result);
    }
    return;
  }
  if (benchmark.run) {
    setImmediate(
      collectSynchronousSample,
      resolve,
      reject,
      benchmark,
      result
    );
  } else if (benchmark.startRunning) {
    setImmediate(
      collectAsynchronousSample,
      resolve,
      reject,
      benchmark,
      result
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
  return result.timingSamples.length >= result.numSamples;
}

/**
 *  release benchmark resources after running
 */
function tearDownBenchmark(benchmark: Benchmark): Error | false {
  if (benchmark.tearDown) {
    try {
      benchmark.tearDown();
    } catch (e) {
      return e;
    }
  }
  return false;
}

/**
 * Run an asynchronous benchmark for the desired number of operations and capture
 * the results
 */
function collectAsynchronousSample(
  resolve: resolveFn,
  reject: rejectFn,
  benchmark: ASynchronousBenchmark,
  result: BenchmarkResult
): void {
  const promises = new Array(result.opsPerSample);

  cleanUpMemory();

  const startMemory = getStartMemory();
  const startTime = getStartTime();

  try {
    // run the benchmark function and collect promises
    for (let i = 0; i < result.opsPerSample; i++) {
      promises[i] = benchmark.startRunning();
    }
  } catch (e) {
    reject(e);
  }

  // take measurements when all promises have been resolved
  Promise.all(promises).then(() => {

    const elapsedTime = getTimeElapsed(startTime);
    const memoryUsed = getMemoryUsed(startMemory);

    recordSample(result, elapsedTime, memoryUsed);

    scheduleNextSample(resolve, reject, benchmark, result);
  });
}

/**
 * Run a synchronous benchmark for the desired number of operations and capture
 * the results
 */
function collectSynchronousSample(
  resolve: resolveFn,
  reject: rejectFn,
  benchmark: SynchronousBenchmark,
  result: BenchmarkResult
) {
  cleanUpMemory();

  const startMemory = getStartMemory();
  const startTime = getStartTime();

  try {
    // run the benchmark function
    for (let i = 0; i < result.opsPerSample; i++) {
      benchmark.run();
    }
  } catch (e) {
    reject(e);
  }

  const elapsedTime = getTimeElapsed(startTime);
  const memoryUsed = getMemoryUsed(startMemory);

  recordSample(result, elapsedTime, memoryUsed);

  scheduleNextSample(resolve, reject, benchmark, result);
}

/**
 * Record a sample memory and time into a benchmark result
 */
function recordSample(benchmarkResult, elapsedTime, memoryUsed) {
  benchmarkResult.timingSamples.push(
    Math.round(elapsedTime / benchmarkResult.opsPerSample)
  );
  benchmarkResult.memorySamples.push(
    Math.round(memoryUsed / benchmarkResult.opsPerSample)
  );
}

/**
 * Read the current time, using the highest resolution timer at our disposal
 */
function getStartTime() {
  return process.hrtime();
}

/**
 * Determine how much time has passed in microseconds since an initial reading was taken
 */
function getTimeElapsed(startTime) {
  const nanoSecondsPerSecond = 1e9;
  const elapsed = process.hrtime(startTime);
  return elapsed[0] * nanoSecondsPerSecond + elapsed[1];
}

/**
 * Read the current memory usage
 */
function getStartMemory() {
  return process.memoryUsage();
}

/**
 * Determine how much memory has been used since an initial reading was taken
 */
function getMemoryUsed(startMemory) {
  const memory = process.memoryUsage();
  return memory.heapUsed - startMemory.heapUsed;
}

/**
 * Put memory into a stable state if we can to avoid triggering gc during a
 * sample run
 */
function cleanUpMemory() {
  if (global.gc) {
    global.gc();
  }
}
