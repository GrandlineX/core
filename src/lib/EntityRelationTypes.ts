import CoreEntity from '../classes/CoreEntity';
import { EntityConfig } from '../classes/annotation';

export interface ICoreEntityHandler {
  createEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    entity: E
  ): Promise<E | null>;
  updateEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    entity: E
  ): Promise<E | null>;
  getEntityById<E extends CoreEntity>(
    config: EntityConfig<E>,
    id: number
  ): Promise<E | null>;
  deleteEntityById(className: string, id: number): Promise<boolean>;
  getEntityList<E extends CoreEntity>(
    config: EntityConfig<E>,
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
