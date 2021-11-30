/* eslint-disable @typescript-eslint/ban-types */

/**
 * Column Data Types
 */
type DataType =
  | 'int'
  | 'float'
  | 'double'
  | 'text'
  | 'string'
  | 'blob'
  | 'boolean'
  | 'serial';

type EPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

/**
 * Constructor parameter interface
 */
type EProperties<T> = Pick<T, EPropertyNames<T>>;

/**
 * Base Entity interface
 */
interface IEntity {
  getEntityName(): string;
}

/**
 * Return type for annotation
 */
type DecorationType = {
  (target: Function): void;
  (target: IEntity, propertyKey: string | symbol): void;
};
type ColumnProps = {
  primaryKey?: boolean;
  unique?: boolean;
  foreignKey?: {
    key: string;
    relation: string;
  };
  canBeNull?: boolean;
  dataType?: DataType;
};
type EntityProps = {
  name: string;
  version: number;
};

type ObjectLike = Object;

export {
  ObjectLike,
  DecorationType,
  IEntity,
  EProperties,
  DataType,
  ColumnProps,
  EntityProps,
};
