import { httpStatusForDomainError } from './domain-error-http.js';

describe('domain error http status', () => {
  it('[B02] maps invalid, missing and conflict to 400, 404 and 409', () => {
    expect(httpStatusForDomainError('invalid')).toBe(400);
    expect(httpStatusForDomainError('missing')).toBe(404);
    expect(httpStatusForDomainError('conflict')).toBe(409);
  });
});
