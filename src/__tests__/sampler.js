

import {
  setUpBenchmark,
  tearDownBenchmark,
  collectAsynchronousSample,
  collectSynchronousSample
} from '../sampler';

import type {
  Dimension,
  DimensionList
} from '../dimension/type';

describe('Sampling', () => {
  const testDimension: Dimension<*> = {
    name: 'test',
    displayName: 'testing',
    units: 'units',
    startMeasuring: () => 1,
    stopMeasuring: start => start + 1
  };
  const dimensions: DimensionList = [testDimension];

  describe('a synchronous benchmark', () => {
    const syncBenchmark = {
      name: 'test',
      run: () => false
    };

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

    describe('that does not define setUp or tearDown', () => {
      it('can setUp', () => {
        expect(setUpBenchmark(syncBenchmark)).toBe(false);
      });

      it('can tearDown', () => {
        expect(tearDownBenchmark(syncBenchmark)).toBe(false);
      });
    });

    describe('that defines a setUp and tearDown', () => {
      const syncBenchmarkWithSetup = {
        name: 'test',
        setUp: jest.fn(),
        run: () => false,
        tearDown: jest.fn()
      };

      it('can setUp', () => {
        const result = setUpBenchmark(syncBenchmarkWithSetup);
        expect(result).toBe(false);
        expect(syncBenchmarkWithSetup.setUp).toBeCalled();
      });

      it('can tearDown', () => {
        const result = tearDownBenchmark(syncBenchmarkWithSetup);
        expect(result).toBe(false);
        expect(syncBenchmarkWithSetup.tearDown).toBeCalled();
      });
    });

    describe('that defines a setUp with an error', () => {
      const syncBenchmarkWithSetUpError = {
        name: 'test',
        setUp: () => {
          throw new Error('Oops');
        },
        run: () => false,
      };

      it('can detect the error', () => {
        expect(setUpBenchmark(syncBenchmarkWithSetUpError)).toBeInstanceOf(Error);
      });
    });

    describe('that defines a setUp that is not a function', () => {
      const syncBenchmarkWithSetUpNotFunction = {
        name: 'test',
        setUp: false,
        run: () => false,
      };

      it('can detect the error', () => {
        expect(setUpBenchmark(syncBenchmarkWithSetUpNotFunction)).toBeInstanceOf(Error);
      });
    });

    describe('that defines a tearDown with an error', () => {
      const syncBenchmarkWithTearDownError = {
        name: 'test',
        run: () => false,
        tearDown: () => {
          throw new Error('Oops');
        },
      };

      it('can detect the error', () => {
        expect(tearDownBenchmark(syncBenchmarkWithTearDownError)).toBeInstanceOf(Error);
      });
    });

    describe('that defines a tearDown that is not a function', () => {
      const syncBenchmarkWithTearDownNotFunction = {
        name: 'test',
        run: () => false,
        tearDown: false,
      };

      it('can detect the error', () => {
        expect(tearDownBenchmark(syncBenchmarkWithTearDownNotFunction)).toBeInstanceOf(Error);
      });
    });

    describe('with an error', () => {
      const syncBenchmarkWithError = {
        name: 'test',
        run: () => {
          throw new Error('Oops');
        }
      };

      it('can detect an error when collecting sample', () => {
        const errorCallback = jest.fn();
        const completedCallback = jest.fn();

        collectSynchronousSample(
          syncBenchmarkWithError,
          dimensions,
          1,
          completedCallback,
          errorCallback
        );
        expect(completedCallback).not.toBeCalled();
        expect(errorCallback).toBeCalled();
      });
    });
  });

  describe('an asynchronous benchmark', () => {
    const asyncBenchmark = {
      name: 'test',
      startRunning: () => Promise.resolve(false)
    };

    it('can collect a sample', () => {
      const task = new Promise((resolve, reject) => {
        collectAsynchronousSample(
          asyncBenchmark,
          dimensions,
          1,
          resolve,
          reject
        );
      });
      return task.then(result => expect(result).toEqual([2]));
    });

    describe('that does not define setUp or tearDown', () => {
      it('can setUp', () => {
        expect(setUpBenchmark(asyncBenchmark)).toBe(false);
      });

      it('can tearDown', () => {
        expect(tearDownBenchmark(asyncBenchmark)).toBe(false);
      });
    });

    describe('that defines a setUp with an error', () => {
      const asyncBenchmarkSetUpError = {
        name: 'test',
        setUp: () => {
          throw new Error('Oops');
        },
        startRunning: () => true
      };

      it('can detect the error', () => {
        const task = new Promise((resolve, reject) => {
          collectAsynchronousSample(
            asyncBenchmarkSetUpError,
            dimensions,
            1,
            resolve,
            reject
          );
        });
        return task.catch(error => expect(error).toBeInstanceOf(Error));
      });
    });

    describe('that defines a tearDown with an error', () => {
      const asyncBenchmarkTearDownError = {
        name: 'test',
        startRunning: () => true,
        tearDown: () => {
          throw new Error('Oops');
        }
      };

      it('can detect the error', () => {
        const task = new Promise((resolve, reject) => {
          collectAsynchronousSample(
            asyncBenchmarkTearDownError,
            dimensions,
            1,
            resolve,
            reject
          );
        });
        return task.catch(error => expect(error).toBeInstanceOf(Error));
      });
    });

    describe('that does not return a promise', () => {
      const asyncBenchmarkNoPromise = {
        name: 'test',
        startRunning: () => true
      };

      it('can collect a sample', () => {
        const task = new Promise((resolve, reject) => {
          collectAsynchronousSample(
            asyncBenchmarkNoPromise,
            dimensions,
            1,
            resolve,
            reject
          );
        });
        return task.then(result => expect(result).toEqual([2]));
      });
    });

    describe('that throws an error', () => {
      const asyncBenchmarkThrowsError = {
        name: 'test',
        startRunning: () => {
          throw new Error('Oops');
        }
      };

      it('can detect an error when collecting sample', () => {
        const task = new Promise((resolve, reject) => {
          collectAsynchronousSample(
            asyncBenchmarkThrowsError,
            dimensions,
            1,
            resolve,
            reject
          );
        });
        return task.catch(error => expect(error).toBeInstanceOf(Error));
      });
    });

    describe('that rejects a promise', () => {
      const asyncBenchmarkRejected = {
        name: 'test',
        startRunning: () => Promise.reject('Oops')
      };

      it('can detect an error when collecting sample', () => {
        const task = new Promise((resolve, reject) => {
          collectAsynchronousSample(
            asyncBenchmarkRejected,
            dimensions,
            1,
            resolve,
            reject
          );
        });
        return task.catch(error => expect(error).toEqual('Oops'));
      });
    });
  });
});
