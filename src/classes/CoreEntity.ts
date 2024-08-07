import { randomUUID } from 'crypto';
import { Column, IEntity } from './annotation/index.js';

/**
 * @name CoreEntity
 * ```typescript
 * // Entity Example
 * @Entity("TestEntity",1)
 *  class TestEntity extends CoreEntity{
 *
 *   @Column({
 *     canBeNull:true,
 *     dataType:"text"
 *   })
 *   name:string|null
 *
 *
 *   @Column()
 *   simpleNumber:number
 *
 *
 *   @Column({
 *     canBeNull:true,
 *   })
 *   missingType:any
 *
 *   @Column({
 *     canBeNull:true,
 *     primaryKey:true
 *   })
 *   primaryKeyNull:any
 *
 *   @Column({
 *     canBeNull:true,
 *     dataType:"float",
 *     foreignKey:{
 *       key:"id",
 *       relation:"test_entity"
 *     }
 *   })
 *   invalidKey:any
 *
 *   notAColumn:string
 *
 *   constructor(val?:EProperties<TestEntity>) {
 *     super();
 *     this.name=val?.name||""
 *     this.notAColumn=val?.notAColumn||""
 *     this.simpleNumber=val?.simpleNumber||0
 *     this.primaryKeyNull=null;
 *     this.invalidKey=null;
 *   }
 * }
 *
 * // Register db entity in BaseModule or in the DbConstructor
 * const db=new CoreDBCon(module)
 * db.registerEntity(new TestEntity())
 * ```
 */

export default abstract class CoreEntity implements IEntity {
  @Column({
    primaryKey: true,
    dataType: 'uuid',
  })
  e_id: string;

  protected constructor(id?: string) {
    this.e_id = id ?? randomUUID();
  }
}
