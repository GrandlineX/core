import crypto from 'crypto';

// eslint-disable-next-line import/prefer-default-export
export function generateSeed(): string {
  return `${crypto.randomBytes(4).readUInt32BE()}`;
}
