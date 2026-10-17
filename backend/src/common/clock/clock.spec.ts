import { SystemClock } from './clock.js';

describe('system clock', () => {
  it('returns the current date', () => {
    const before = Date.now();
    const now = new SystemClock().now();
    expect(now).toBeInstanceOf(Date);
    expect(now.getTime()).toBeGreaterThanOrEqual(before);
  });
});
