import { getColumnMeta, validateColumnMeta, validateEntity } from '../src';
import {  getEntityMeta } from '../src';
import { BadEntity, TestEntity } from './DebugClasses';



describe("annotation",()=>{
  const  first= new TestEntity({
    name:"Bob",
    notAColumn:"test",
    simpleNumber:1,
    invalidKey:0.1
  });
  test("entity props",()=>{
    const classMeta=getEntityMeta(first);
    expect(classMeta?.name).toBe(first.constructor.name)
    expect(classMeta?.version).toBe(1)
  })
  test("entity props empty",()=>{

    const classMeta=getEntityMeta(new BadEntity());
    expect(classMeta).toBeUndefined()
  })
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
  test("full validation",()=>{
      expect(validateEntity(first)).toBeFalsy()
  })
})