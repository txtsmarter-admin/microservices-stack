import { omit } from '../../src/lib/type.utils';

describe('omit()', () => {
  test('coverage test', () => {
    const obj = { a: 1, b: 'hi', c: 'yo' };
    expect(omit(obj, ['a', 'b'])).toStrictEqual({ c: 'yo' });
  });
});
