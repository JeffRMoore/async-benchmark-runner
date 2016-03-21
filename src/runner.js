/**
 * Describe a synchronous benchmark
 */
export type SynchronousBenchmark =
{
  name: string;
  run: () => mixed;
}

/**
 * Describe an asynchronous benchmark
 */
export type ASynchronousBenchmark =
{
  name: string;
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
    scheduleBenchmark(resolve, reject, benchmarkSuite, suiteResult);
  });
}

type resolveFn = (value:mixed) => void;

type rejectFn = (value:mixed) => void;

/**
 * Schedule a benchmark to be run at a later time
 */
function scheduleBenchmark(
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

  const initialResult:BenchmarkResult = {
    name: 'Benchmark #',
    opsPerSample: 100,
    numSamples: 20,
    timingSamples: [],
    memorySamples: []
  };

  const resolveBenchmark = (finalResult: BenchmarkResult) => {
    suiteResult.results.push(finalResult);
    scheduleBenchmark(resolve, reject, benchmarkSuite, suiteResult);
  };

  scheduleSample(resolveBenchmark, reject, benchmark, initialResult);
}

/**
 * Schedule sample collection
 */
function scheduleSample(
  resolve: resolveFn,
  reject: rejectFn,
  benchmark: ASynchronousBenchmark,
  result: BenchmarkResult
) {
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
 * Run an asynchronous benchmark for the desired number of operations and capture
 * the results
 */
function collectAsynchronousSample(
  resolve: resolveFn,
  reject: rejectFn,
  benchmark: ASynchronousBenchmark,
  result: BenchmarkResult
) {
  cleanUpMemory();

  const promises = new Array(result.opsPerSample);

  const startMemory = getStartMemory();
  const startTime = getStartTime();

  // run the benchmark function and collect promises
  for (let i = 0; i < result.opsPerSample; i++) {
    promises[i] = benchmark.startRunning();
  }

  // take measurements when all promises have been resolved
  Promise.all(promises).then(() => {

    const elapsedTime = getTimeElapsed(startTime);
    const memoryUsed = getMemoryUsed(startMemory);

    recordSample(result, elapsedTime, memoryUsed);

    if (isSamplingComplete(result)) {
      resolve(result);
    } else {
      scheduleSample(resolve, reject, benchmark, result);
    }
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

  // run the benchmark function
  for (let i = 0; i < result.opsPerSample; i++) {
    benchmark.run();
  }

  const elapsedTime = getTimeElapsed(startTime);
  const memoryUsed = getMemoryUsed(startMemory);

  recordSample(result, elapsedTime, memoryUsed);

  if (isSamplingComplete(result)) {
    resolve(result);
  } else {
    scheduleSample(resolve, reject, benchmark, result);
  }
}

/**
 * Does the result contain all required samples?
 */
function isSamplingComplete(result: BenchmarkResult) {
  return result.timingSamples.length >= result.numSamples;
}

/**
 * Record a sample memory and time into a benchmark result
 */
function recordSample(benchmarkResult, elapsedTime, memoryUsed) {
  benchmarkResult.timingSamples.push(elapsedTime);
  benchmarkResult.memorySamples.push(memoryUsed);
}

/**
 * Read the current time, using the highest resolution timer at our disposal
 */
function getStartTime() {
  return process.hrtime();
}

/**
 * Convert an array from process.hrtime into an integer microseconds number
 */
function convertHrTimeToMicroseconds(hrTime) {
  const microsecondsPerSecond = 1000000;
  const microsecondsPerNanoSecond = 1000;
  return Math.round(
    hrTime[0] * microsecondsPerSecond + hrTime[1] / microsecondsPerNanoSecond
  );
}

/**
 * Determine how much time has passed in microseconds since an initial reading was taken
 */
function getTimeElapsed(startTime) {
  const elapsed = process.hrtime(startTime);
  return convertHrTimeToMicroseconds(elapsed);
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
