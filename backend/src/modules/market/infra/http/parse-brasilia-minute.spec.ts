import { parseBrasiliaMinute } from './parse-brasilia-minute.js';

describe('Brasília minute', () => {
  it('reads a minute in the fixed offset as the matching instant', () => {
    expect(parseBrasiliaMinute('2027-03-02T10:15-03:00')?.toISOString()).toBe(
      '2027-03-02T13:15:00.000Z',
    );
  });

  it('rejects another format or a date that does not exist', () => {
    expect(parseBrasiliaMinute('2027-03-02T10:15:00-03:00')).toBeNull();
    expect(parseBrasiliaMinute('2027-03-02T10:15Z')).toBeNull();
    expect(parseBrasiliaMinute('2027-02-30T10:15-03:00')).toBeNull();
    expect(parseBrasiliaMinute('2027-03-02T24:00-03:00')).toBeNull();
  });
});
