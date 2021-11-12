export interface ICoreEntityHandler {
  createEntity<E extends CoreEntity>(entity: E): Promise<E | null>;
  updateEntity<E extends CoreEntity>(entity: E): Promise<E | null>;
  getEntityById<E extends CoreEntity>(
    className: string,
    id: number
  ): Promise<E | null>;
  deleteEntityById(className: string, id: number): Promise<boolean>;
  getEntityList<E extends CoreEntity>(className: string): Promise<E[]>;
}

export default abstract class CoreEntity {
  e_version: number;

  e_id: number | null;

  protected constructor(version: number) {
    this.e_version = version;
    this.e_id = null;
  }
}
