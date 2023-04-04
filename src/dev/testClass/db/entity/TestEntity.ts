import {
  Column,
  CoreEntity,
  Entity,
  EProperties,
} from '../../../../classes/index.js';

@Entity('TestEntity')
export default class TestEntity extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  name: string;

  @Column({
    canBeNull: true,
    dataType: 'string',
  })
  address: string | null;

  @Column({
    dataType: 'int',
  })
  age: number;

  @Column({
    canBeNull: true,
    dataType: 'date',
  })
  time: Date | null;

  @Column({
    canBeNull: true,
    dataType: 'blob',
  })
  raw: Buffer | null;

  @Column({
    canBeNull: true,
    dataType: 'json',
  })
  json: any | null;

  constructor(param?: EProperties<TestEntity>) {
    super();
    this.name = param?.name || '';
    this.address = param?.address || null;
    this.age = param?.age || -1;
    this.time = param?.time || null;
    this.raw = param?.raw || null;
    this.json = param?.json || null;
  }
}
