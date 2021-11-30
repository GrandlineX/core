import 'reflect-metadata';
import { ColumnProps, DecorationType, IEntity } from './types';

const columnKey = Symbol('column');

function Column(props?: ColumnProps): DecorationType {
  let prop: ColumnProps;
  if (!props) {
    prop = {};
  } else {
    prop = props;
  }
  return Reflect.metadata(columnKey, prop);
}

function getColumnMeta<T extends IEntity>(
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
