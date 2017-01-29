/* @flow */

import {
  formatLeft,
  formatRight
} from '../format';

jest.unmock('../format');

describe('formatLeft', () => {
  it('pads a string to the requested length', () => {
    const expectedString = 'betty   ';
    const result = formatLeft('betty', expectedString.length);
    expect(result).toBe(expectedString);
  });

  it('converts numbers to strings', () => {
    const aNumber = 123;
    const expectedString = '123';
    const result = formatLeft(aNumber, expectedString.length);
    expect(result).toBe(expectedString);
  });

  it('indicates when value to format exceeds allowed length', () => {
    const value = 'betty';
    const expectedString = '****';
    const result = formatLeft(value, value.length - 1);
    expect(result).toBe(expectedString);
  });

  it('does not pad for exact length', () => {
    const value = 'betty';
    const result = formatLeft(value, value.length);
    expect(result).toBe(value);
  });
});

describe('formatRight', () => {
  it('pads a string to the requested length', () => {
    const expectedString = '   betty';
    const result = formatRight('betty', expectedString.length);
    expect(result).toBe(expectedString);
  });

  it('converts numbers to strings', () => {
    const aNumber = 123;
    const expectedString = '123';
    const result = formatRight(aNumber, expectedString.length);
    expect(result).toBe(expectedString);
  });

  it('indicates when value to format exceeds allowed length', () => {
    const value = 'betty';
    const expectedString = '****';
    const result = formatRight(value, value.length - 1);
    expect(result).toBe(expectedString);
  });

  it('does not pad for exact length', () => {
    const value = 'betty';
    const result = formatRight(value, value.length);
    expect(result).toBe(value);
  });
});
