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
type EProperties<T> = Omit<Pick<T, EPropertyNames<T>>, 'e_id'>;
type EPropertiesOpt<T> = Partial<EProperties<T>>;
type EUpDateProperties<T> = Partial<EProperties<T>>;
type SortBy = 'ASC' | 'DESC';
type EOrderBy<T> = {
  key: keyof T;
  order: SortBy;
}[];
type ObjectLike = Object;

export {
  DataType,
  EPropertyNames,
  EProperties,
  EPropertiesOpt,
  EUpDateProperties,
  SortBy,
  EOrderBy,
  ObjectLike,
};
