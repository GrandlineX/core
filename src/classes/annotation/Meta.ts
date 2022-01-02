import 'reflect-metadata';

import { ObjectLike } from './lib/props';
import { ColumnProps, EntityProps, IEntity } from './lib/types';
import { camelToSnakeCase, ClassNameInterface } from './util/nameUtil';

const columnKey = Symbol('column');
const entityKey = Symbol('entity');

function getEntityMeta<T extends ObjectLike>(
  target: T
): EntityProps | undefined {
  return Reflect.getMetadata(entityKey, target.constructor.prototype);
}

function Column(props?: ColumnProps): PropertyDecorator {
  let prop: ColumnProps;
  if (!props) {
    prop = {};
  } else {
    prop = props;
  }

  return Reflect.metadata(columnKey, prop);
}

function getColumnMeta<T>(
  target: T,
  propertyKey: keyof T
): ColumnProps | undefined {
  if (typeof propertyKey === 'number') {
    throw new Error('no numeric objkey is allowed');
  }

  return Reflect.getMetadata(columnKey, target, propertyKey);
}

function validateColumnMeta(props?: ColumnProps): boolean {
  if (!props) {
    return false;
  }
  if (props.canBeNull && props.dataType === undefined) {
    return false;
  }
  if (props.canBeNull && props.primaryKey) {
    return false;
  }
  if (
    props.foreignKey &&
    (!props.dataType ||
      props.dataType === 'float' ||
      props.dataType === 'double' ||
      props.dataType === 'blob' ||
      props.dataType === 'boolean')
  ) {
    return false;
  }

  return true;
}

export { Column, getColumnMeta, validateColumnMeta };

const Entity = (name: string, version = 0): ClassDecorator => {
  return (target) => {
    const metadata = {
      name,
      version,
    };
    Reflect.defineMetadata(entityKey, metadata, target.prototype);
  };
};

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

/**
 * getTableName  by entity
 * @param entity
 */
export function getEntityNames(entity: IEntity): ClassNameInterface {
  const meta = getEntityMeta(entity);
  if (!meta) {
    throw new Error('InvalidClassMeta');
  }
  return {
    className: meta.name,
    tableName: camelToSnakeCase(meta.name),
  };
}

export { Entity, getEntityMeta, validateEntity };
