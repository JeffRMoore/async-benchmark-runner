

import {
  startBenchmarking
} from '../runner';

jest.unmock('../runner.js');

describe('Basic benchmark suite', () => {
  pit('has the correct name', async () => {
    const expectedName = 'betty';
    const result = await startBenchmarking(expectedName, [], []);
    expect(result.name).toBe(expectedName);
  });

  pit('has a start date in the future', async () => {
    const thePast = Date.now();
    const result = await startBenchmarking('test', [], []);
    expect(result.startTime).not.toBeLessThan(thePast);
  });
});

describe('Consecutive benchmark runs', () => {
  pit('have a consecutive start time', async () => {
    const result1 = await startBenchmarking('test', [], []);
    const result2 = await startBenchmarking('test', [], []);
    expect(result2.startTime).not.toBeLessThan(result1.startTime);
  });
});
