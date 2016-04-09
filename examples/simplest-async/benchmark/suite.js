exports.benchmarkSuiteName = 'Simple Suite';

exports.benchmarks = [
  {
    name: 'NO-OP Asynchronous',
    startRunning: () => {
      return Promise.resolve(false);
    }
  }
];
