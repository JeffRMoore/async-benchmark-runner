

import {
  setupBenchmark,
  tearDownBenchmark,
  collectAsynchronousSample,
  collectSynchronousSample
} from '../sampler';

import type {
  Dimension,
  DimensionList
} from '../dimension/type';

describe('Sampler', () => {
  const testDimension: Dimension<*> = {
    name: 'test',
    displayName: 'testing',
    units: 'units',
    startMeasuring: () => 1,
    stopMeasuring: start => start + 1
  };
  const dimensions: DimensionList = [testDimension];

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

    it('can collect a sample', () => {
      const errorCallback = jest.fn();
      const completedCallback = jest.fn();

      collectSynchronousSample(
        syncBenchmark,
        dimensions,
        1,
        completedCallback,
        errorCallback
      );
      expect(errorCallback).not.toBeCalled();
      expect(completedCallback).toBeCalledWith([2]);
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

    it('can collect a sample', () => {
      const task = new Promise((resolve, reject) => {
        collectAsynchronousSample(
          syncBenchmark,
          dimensions,
          1,
          resolve,
          reject
        );
      });
      return task.then(result => expect(result).toEqual([2]));
    });
  });
});
