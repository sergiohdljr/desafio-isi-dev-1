import { formatBrasilia } from './brasilia-time.js';

describe('Brasília time', () => {
  it('formats the instant as Brasília wall time without daylight saving', () => {
    expect(formatBrasilia(new Date('2027-03-02T13:15:30.000Z'))).toBe(
      '2027-03-02T10:15:30-03:00',
    );
    expect(formatBrasilia(new Date('2027-03-02T01:00:00.000Z'))).toBe(
      '2027-03-01T22:00:00-03:00',
    );
  });
});
