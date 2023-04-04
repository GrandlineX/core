import { Column, Entity, EProperties } from '../../classes/annotation/index.js';
import CoreEntity from '../../classes/CoreEntity.js';

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
    this.secret = props?.secret || '';
    this.iv = props?.iv || Buffer.from('');
    this.auth = props?.auth || Buffer.from('');
  }
}
