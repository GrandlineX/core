import { Column } from './annotation';

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

export default abstract class CoreEntity {
  @Column({
    primaryKey: true,
  })
  e_id: number;

  protected constructor() {
    this.e_id = -1;
  }
}
