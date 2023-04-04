import CoreEntity from '../CoreEntity.js';
import { ColumnProps } from './lib/types.js';
import { columnKey } from './Meta.js';
import { XUtil } from '../../utils/index.js';

function EntityColumn<T extends CoreEntity>(
  entity: T,
  schema?: string,
  props?: Partial<ColumnProps>
): PropertyDecorator {
  return Reflect.metadata(columnKey, {
    ...XUtil.entityRelationColumn(entity, schema),
    ...props,
  });
}
// eslint-disable-next-line import/prefer-default-export
export { EntityColumn };
