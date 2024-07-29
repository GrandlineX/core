import { Column, Entity, EProperties } from '../../../../classes/index.js';
import TestEntity from './TestEntity.js';
import { XUtil } from '../../../../utils/index.js';

@Entity('TestEntityLinked')
export default class TestEntityLinked extends TestEntity {
  @Column({
    dataType: 'string',
    unique: true,
    canBeNull: true,
    foreignKey: {
      key: 'e_id',
      relation: XUtil.camelToSnakeCase('TestEntity'),
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
    this.link = param?.link ?? 'null';
    this.flag = !!param?.flag;
    this.floating = param?.floating ?? 0.0;
  }
}
