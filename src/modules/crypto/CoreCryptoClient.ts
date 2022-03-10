import * as crypto from 'crypto';
import { ICoreCClient } from '../../lib';

const encryptionType = 'aes-256-gcm';
const encryptionEncoding = 'base64';
const bufferEncryption = 'utf8';

export default class CoreCryptoClient implements ICoreCClient {
  protected AesKey: string;

  protected AesIV: string;

  constructor(key: string) {
    if (key.length !== 32) {
      throw new Error('INVALID KEY LENGTH');
    }
    this.AesKey = key;
    this.AesIV = key.substring(0, 16);
  }

  static fromPW(pw: string): string {
    const shasum = crypto.createHash('sha512').update(pw).digest('hex');
    return shasum.substring(0, 32);
  }

  generateSecureToken(length: number): Promise<string> {
    return new Promise<string>((resolve) => {
      crypto.randomBytes(length, (err, buf) => {
        if (err) {
          resolve('');
        } else {
          resolve(buf.toString('hex'));
        }
      });
    });
  }

  encrypt(message: string): {
    auth: Buffer;
    iv: Buffer;
    enc: string;
  } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(encryptionType, this.AesKey, iv);

    let enc = cipher.update(message, bufferEncryption, encryptionEncoding);
    enc += cipher.final(encryptionEncoding);
    return {
      auth: cipher.getAuthTag(),
      iv,
      enc,
    };
  }

  decrypt(enc: string, iv: Buffer, authTag: Buffer): string {
    const decipher = crypto.createDecipheriv(encryptionType, this.AesKey, iv);
    decipher.setAuthTag(Buffer.from(authTag));
    let str = decipher.update(enc, encryptionEncoding, bufferEncryption);
    str += decipher.final(bufferEncryption);
    return str;
  }

  isValid(): boolean {
    return this.AesKey.length === 32;
  }

  getHash(seed: string, val: string): string {
    return crypto
      .createHash('sha512')
      .update(seed + val)
      .digest('hex');
  }

  getUUID(): string {
    return crypto.randomUUID();
  }
}
