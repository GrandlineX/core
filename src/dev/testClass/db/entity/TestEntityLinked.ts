import {
  camelToSnakeCase,
  Column,
  Entity,
  EProperties,
} from '../../../../classes';
import TestEntity from './TestEntity';

@Entity('TestEntityLinked')
export default class TestEntityLinked extends TestEntity {
  @Column({
    dataType: 'string',
    unique: true,
    canBeNull: true,
    foreignKey: {
      key: 'e_id',
      relation: camelToSnakeCase('TestEntity'),
    },
  })
  link: string | null;

  @Column({
    dataType: 'boolean',
  })
  flag: boolean;

  @Column({
    dataType: 'float',
  })
  floating: number;

  constructor(param?: EProperties<TestEntityLinked>) {
    super(param);
    this.link = param?.link || 'null';
    this.flag = !!param?.flag;
    this.floating = param?.floating || 0.0;
  }
}
