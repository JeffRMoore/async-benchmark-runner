/* @flow */

import {
  startMeasuring,
  stopMeasuring
} from '../list';

import {
  FifthDimension
} from '../fifth';

import type {
  Dimension
} from '../type';

export const FlatLandDimension: Dimension<number> = {
  name: 'two',
  displayName: 'two',
  units: '-',
  startMeasuring: (): number => 1,
  stopMeasuring: (start: number): number => start + 1
};

describe('startMeasuring', () => {
  it('produces measurements', () => {
    expect(startMeasuring([FifthDimension])).toEqual([3]);
  });
  it('measures the first dimension in the DimensionList first', () => {
    expect(startMeasuring([FlatLandDimension, FifthDimension])).toEqual([1, 3]);
  });
});

describe('stopMeasuring', () => {
  it('produces measurements', () => {
    const starting = [3];
    const ending = [0];
    expect(stopMeasuring([FifthDimension], starting, ending)).toEqual([5]);
  });

  it('updates elements of the ending parameter', () => {
    const starting = [3];
    const ending = [0];
    stopMeasuring([FifthDimension], starting, ending);
    expect(ending).toEqual([5]);
  });

  it('measures the last dimension in the DimensionList first', () => {
    const starting = [1, 3];
    const ending = [0, 0];
    expect(stopMeasuring([FlatLandDimension, FifthDimension], starting, ending))
      .toEqual([2, 5]);
  });
});
