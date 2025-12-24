import { Column, Entity, EProperties } from '../../classes/annotation/index.js';
import CoreEntity from '../../classes/CoreEntity.js';

/**
 * Represents a cryptographic key with its associated metadata.
 *
 * @class GKey
 * @extends CoreEntity
 * @property {string} secret - The secret value of the key stored as text.
 * @property {Buffer} iv - Initialization vector used in encryption operations.
 * @property {Buffer} auth - Authentication tag used to verify data integrity.
 *
 * @constructor
 * @param {EProperties<GKey>} [props] - Optional initial values for the key properties.
 */
@Entity('GKey', 0)
export default class GKey extends CoreEntity {
  @Column({
    dataType: 'text',
  })
  secret: string;

  @Column({
    dataType: 'blob',
  })
  iv: Buffer;

  @Column({
    dataType: 'blob',
  })
  auth: Buffer;

  constructor(props?: EProperties<GKey>) {
    super();
    this.secret = props?.secret ?? '';
    this.iv = props?.iv || Buffer.from('');
    this.auth = props?.auth || Buffer.from('');
  }
}
