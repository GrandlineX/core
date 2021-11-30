import { CoreEntity, Column, getColumnMeta, EProperties, validateColumnMeta } from '../src';


class TestEntity extends CoreEntity{

  @Column({
    canBeNull:true,
    dataType:"text"
  })
  name:string|null


  @Column()
  simpleNumber:number


  @Column({
    canBeNull:true,
  })
  missingType:any

  @Column({
    canBeNull:true,
    primaryKey:true
  })
  primaryKeyNull:any

  @Column({
    canBeNull:true,
    dataType:"float",
    foreignKey:{
      key:"id",
      relation:"test_entity"
    }
  })
  invalidKey:any

  notAColumn:string

  constructor(val?:EProperties<TestEntity>) {
    super();
    this.name=val?.name||""
    this.notAColumn=val?.notAColumn||""
    this.simpleNumber=val?.simpleNumber||0
    this.primaryKeyNull=null;
    this.invalidKey=null;
  }
  getEntityName(): string {
    return 'TestEntity';
  }
}

describe("annotation",()=>{
  const  first= new TestEntity({
    e_id:null,
    name:"Bob",
    notAColumn:"test",
    simpleNumber:1,
    missingType:null,
    primaryKeyNull:null,
    invalidKey:0.1,
  });
  test("e_id is primary key",()=>{
      const meta= getColumnMeta(first,"e_id");
      expect(meta).not.toBeUndefined()
      expect(meta?.primaryKey).toBeTruthy()
      expect(validateColumnMeta(meta)).toBeTruthy()
  })
  test("name is valid",()=>{
      const meta= getColumnMeta(first,"name");
      expect(meta).not.toBeUndefined()
      expect(meta?.canBeNull).toBeTruthy()
      expect(meta?.dataType).toBe("text")
      expect(validateColumnMeta(meta)).toBeTruthy()
  })
  test("detect key not a column",()=>{
      const meta= getColumnMeta(first,"notAColumn");
      expect(meta).toBeUndefined()
      expect(validateColumnMeta(meta)).toBeFalsy()
  })
  test("simple data type",()=>{
      const meta= getColumnMeta(first,"simpleNumber");
      expect(meta).not.toBeUndefined()
      expect(meta).toStrictEqual({})
      expect(validateColumnMeta(meta)).toBeTruthy()
  })

  test("detect missingType",()=>{
      const meta= getColumnMeta(first,"missingType");
      expect(meta).not.toBeUndefined()
      expect(meta?.canBeNull).toBeTruthy()
      expect(validateColumnMeta(meta)).toBeFalsy()
  })
  test("detect primaryKeyNull",()=>{
      const meta= getColumnMeta(first,"primaryKeyNull");
      expect(meta).not.toBeUndefined()
    expect(meta?.canBeNull).toBeTruthy()
    expect(meta?.primaryKey).toBeTruthy()

    expect(validateColumnMeta(meta)).toBeFalsy()
  })
  test("detect invalidKey",()=>{
      const meta= getColumnMeta(first,"invalidKey");
      expect(meta).not.toBeUndefined()
      expect(meta?.canBeNull).toBeTruthy()
      expect(meta?.dataType).toBe("float")
      expect(meta?.foreignKey).not.toBeUndefined()
      expect(validateColumnMeta(meta)).toBeFalsy()
  })
})