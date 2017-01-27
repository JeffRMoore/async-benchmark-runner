

import {
  setupBenchmark,
  tearDownBenchmark
} from '../sampler';

describe('Sampler', () => {
  describe('synchronous benchmark without context', () => {
    const syncBenchmark = {
      name: 'test',
      run: () => false
    };

    it('can setUp', () => {
      expect(setupBenchmark(syncBenchmark)).toBe(false);
    });

    it('can tearDown', () => {
      expect(tearDownBenchmark(syncBenchmark)).toBe(false);
    });
  });

  describe('asynchronous benchmark without context', () => {
    const syncBenchmark = {
      name: 'test',
      startRunning: () => Promise.resolve(false)
    };

    it('can setUp', () => {
      expect(setupBenchmark(syncBenchmark)).toBe(false);
    });

    it('can tearDown', () => {
      expect(tearDownBenchmark(syncBenchmark)).toBe(false);
    });
  });
});
