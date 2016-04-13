exports.name = 'Simple Suite';

exports.benchmarks = [
  {
    name: 'NO-OP Asynchronous',
    startRunning: () => {
      return Promise.resolve(false);
    }
  }
];
