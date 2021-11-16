import CoreEntity from '../classes/CoreEntity';

export interface ICoreEntityHandler {
  createEntity<E extends CoreEntity>(
    className: string,
    entity: E
  ): Promise<E | null>;
  updateEntity<E extends CoreEntity>(
    className: string,
    entity: E
  ): Promise<E | null>;
  getEntityById<E extends CoreEntity>(
    className: string,
    id: number
  ): Promise<E | null>;
  deleteEntityById(className: string, id: number): Promise<boolean>;
  getEntityList<E extends CoreEntity>(
    className: string,
    search?: {
      [P in keyof E]?: E[P];
    }
  ): Promise<E[]>;
  findEntity<E extends CoreEntity>(
    className: string,
    search: {
      [P in keyof E]?: E[P];
    }
  ): Promise<E | null>;
  initEntity<E extends CoreEntity>(
    className: string,
    entity: E
  ): Promise<boolean>;
}
