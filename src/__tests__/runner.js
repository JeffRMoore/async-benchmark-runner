
jest.unmock('../runner.js');

import {
  startBenchmarking
} from '../runner.js';

describe('Empty benchmark Suite', () => {

  pit('has the correct name', async () => {
    const expectedName = 'betty';
    const result = await startBenchmarking(expectedName, [], {});
    expect(result.name).toBe(expectedName);
  });

});
