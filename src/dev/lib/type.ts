import Type from '../../utils/Type.js';

export default function jestType() {
  describe('type', () => {
    describe('Type', () => {
      test('isUUID - valid', () => {
        expect(Type.isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      });
      test('isUUID - invalid', () => {
        expect(Type.isUUID('not-a-uuid')).toBe(false);
        expect(Type.isUUID('')).toBe(false);
        expect(Type.isUUID('550e8400-e29b-41d4-a716')).toBe(false);
      });
      test('isIsoDate - valid', () => {
        expect(Type.isIsoDate('2024-01-01T00:00:00Z')).toBe(true);
        expect(Type.isIsoDate('2024-01-01T00:00:00.000Z')).toBe(true);
        expect(Type.isIsoDate('2024-01-01T12:30:59.123+05:30')).toBe(true);
      });
      test('isIsoDate - invalid', () => {
        expect(Type.isIsoDate('2024-01-01')).toBe(false);
        expect(Type.isIsoDate('not a date')).toBe(false);
        expect(Type.isIsoDate('')).toBe(false);
      });
      test('isString - valid non-empty string', () => {
        expect(Type.isString('hello')).toBe(true);
      });
      test('isString - empty string is false', () => {
        expect(Type.isString('')).toBe(false);
      });
      test('isString - non-string is false', () => {
        expect(Type.isString(42)).toBe(false);
        expect(Type.isString(null)).toBe(false);
        expect(Type.isString(undefined)).toBe(false);
      });
      test('isNumber - valid numbers', () => {
        expect(Type.isNumber(42)).toBe(true);
        expect(Type.isNumber(0)).toBe(true);
        expect(Type.isNumber(-1.5)).toBe(true);
      });
      test('isNumber - non-number is false', () => {
        expect(Type.isNumber('42')).toBe(false);
        expect(Type.isNumber(null)).toBe(false);
      });
      test('isBoolean - true and false', () => {
        expect(Type.isBoolean(true)).toBe(true);
        expect(Type.isBoolean(false)).toBe(true);
      });
      test('isBoolean - non-boolean is false', () => {
        expect(Type.isBoolean(0)).toBe(false);
        expect(Type.isBoolean('true')).toBe(false);
      });
    });
  });
}
