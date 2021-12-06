import CoreEntity from '../classes/CoreEntity';
import {
  EntityConfig,
  EProperties,
  EUpDateProperties,
} from '../classes/annotation';

export interface ICoreEntityHandler {
  createEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    entity: EProperties<E>
  ): Promise<E>;
  updateEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    e_id: number,
    entity: EUpDateProperties<E>
  ): Promise<boolean>;
  getEntityById<E extends CoreEntity>(
    config: EntityConfig<E>,
    e_id: number
  ): Promise<E | null>;
  deleteEntityById(className: string, id: number): Promise<boolean>;
  getEntityList<E extends CoreEntity>(
    config: EntityConfig<E>,
    limit?: number,
    search?: {
      [P in keyof E]?: E[P];
    }
  ): Promise<E[]>;
  findEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    search: {
      [P in keyof E]?: E[P];
    }
  ): Promise<E | null>;
  initEntity<E extends CoreEntity>(
    className: string,
    entity: E
  ): Promise<boolean>;
}
