import { DataType } from './props.js';

export interface ColumnPropsBase {
  primaryKey?: boolean;
  unique?: boolean;
  canBeNull?: boolean;
  dataType: DataType;
}

export interface ColumnProps extends ColumnPropsBase {
  foreignKey?: {
    key: string;
    relation: string;
    schema?: string;
  };
}

type ColumnPropMap<E> = Map<keyof E, ColumnProps>;
type EntityConfig<E> = {
  className: string;
  meta: ColumnPropMap<E>;
};
type EntityProps = {
  name: string;
  version: number;
};

type IEntity = {
  e_id: string;
};

function instanceOfEntity(object: any): object is IEntity {
  return (
    object !== undefined &&
    object !== null &&
    object.e_id !== undefined &&
    typeof object.e_id === 'string'
  );
}

export { ColumnPropMap, EntityProps, EntityConfig, IEntity };
export { instanceOfEntity };
