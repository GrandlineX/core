import {
  Column,
  CoreEntity,
  Entity,
  EPropertiesOpt,
} from '../../../../classes';
import { XUtil } from '../../../../utils';
import TestEntity from './TestEntity';

@Entity('TestEnt', 1)
export default class TestEnt extends CoreEntity {
  @Column({
    canBeNull: true,
    dataType: 'text',
  })
  name: string | null;

  @Column({
    dataType: 'int',
  })
  simpleNumber: number;

  @Column({
    canBeNull: true,
    dataType: 'json',
  })
  missingType: any;

  @Column({
    canBeNull: true,
    primaryKey: true,
    dataType: 'float',
  })
  primaryKeyNull: any;

  @Column({
    canBeNull: true,
    dataType: 'float',
    foreignKey: {
      key: 'id',
      relation: 'test_entity',
    },
  })
  invalidKey: any;

  @Column({
    canBeNull: true,
    dataType: 'float',
    foreignKey: XUtil.entityRelation(new TestEntity(), 'noSchema'),
  })
  autoRelation: number;

  notAColumn: string;

  constructor(val?: EPropertiesOpt<TestEnt>) {
    super();
    this.name = val?.name || '';
    this.notAColumn = val?.notAColumn || '';
    this.simpleNumber = val?.simpleNumber || 0;
    this.primaryKeyNull = null;
    this.invalidKey = null;
    this.autoRelation = val?.autoRelation || -1;
  }
}
