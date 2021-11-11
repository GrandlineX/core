export interface ICoreEntityHandler {
  createEntity<E extends CoreEntity<any>>(entity: E): Promise<E | null>;
  updateEntity<E extends CoreEntity<any>>(entity: E): Promise<E | null>;
  getEntityById<E extends CoreEntity<any>>(
    entity: E,
    id: number
  ): Promise<E | null>;
  deleteEntityById<E extends CoreEntity<any>>(
    entity: E,
    id: number
  ): Promise<boolean>;
  getEntityList<E extends CoreEntity<any>>(entity: E): Promise<E[]>;
}
export default abstract class CoreEntity<T> {
  e_version: number;

  e_id: number | null;

  e_con: ICoreEntityHandler;

  protected constructor(version: number, con: ICoreEntityHandler) {
    this.e_version = version;
    this.e_con = con;
    this.e_id = null;
  }

  async createObject(args: this): Promise<this | null> {
    return this.e_con.createEntity<this>(args);
  }

  async updateObject(): Promise<this | null> {
    return this.e_con.updateEntity<this>(this);
  }

  async getObjById(id: number): Promise<this | null> {
    return this.e_con.getEntityById<this>(this, id);
  }

  async getObjList(): Promise<this[]> {
    return this.e_con.getEntityList<this>(this);
  }

  async delete(): Promise<boolean> {
    if (this.e_id) {
      return this.e_con.deleteEntityById(this, this.e_id);
    }
    return false;
  }
}
