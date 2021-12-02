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
  | 'json'
  | 'date'
  | 'serial';

type EPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

/**
 * Constructor parameter interface
 */
type EProperties<T> = Pick<T, EPropertyNames<T>>;

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
type ColumnPropMap<E> = Map<keyof E, ColumnProps>;
type EntityConfig<E> = {
  className: string;
  meta: ColumnPropMap<E>;
};
type EntityProps = {
  name: string;
  version: number;
};

type ObjectLike = Object;

export {
  EPropertyNames,
  ObjectLike,
  ColumnPropMap,
  EProperties,
  DataType,
  ColumnProps,
  EntityProps,
  EntityConfig,
};
