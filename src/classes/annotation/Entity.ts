import 'reflect-metadata';
import { EntityProps, ObjectLike } from './types';

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

export { Entity, getEntityMeta };
