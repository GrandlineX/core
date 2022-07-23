import CoreEntity from '../CoreEntity';
import { ColumnProps } from './lib/types';
import { columnKey } from './Meta';
import { XUtil } from '../../utils';

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
