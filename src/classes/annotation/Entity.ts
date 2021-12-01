import 'reflect-metadata';
import { EntityProps, ObjectLike } from './types';
import { getColumnMeta, validateColumnMeta } from './Column';

const entityKey = Symbol('entity');

const Entity = (name: string, version = 0): ClassDecorator => {
  return (target) => {
    const metadata = {
      name,
      version,
    };
    Reflect.defineMetadata(entityKey, metadata, target.prototype);
  };
};

function getEntityMeta<T extends ObjectLike>(
  target: T
): EntityProps | undefined {
  return Reflect.getMetadata(entityKey, target.constructor.prototype);
}

function validateEntity<T extends ObjectLike>(target: T): boolean {
  const meta = getEntityMeta(target);
  if (!meta) {
    return false;
  }
  const keys = Object.keys(target) as (keyof T)[];
  for (const key of keys) {
    const cMeta = getColumnMeta(target, key);
    if (cMeta && !validateColumnMeta(cMeta)) {
      return false;
    }
  }
  return true;
}
export { Entity, getEntityMeta, validateEntity };
