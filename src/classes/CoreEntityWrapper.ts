import CoreEntity from './CoreEntity';
import { ICoreEntityHandler } from '../lib/EntityRelationTypes';

export default class CoreEntityWrapper<E extends CoreEntity> {
  protected e_con: ICoreEntityHandler;

  protected className: string;

  getIns: () => E;

  constructor(con: ICoreEntityHandler, name: string, getIns: () => E) {
    this.e_con = con;
    this.className = name;
    this.getIns = getIns;
  }

  async createObject(args: E): Promise<E | null> {
    return this.e_con.createEntity(args);
  }

  async updateObject(args: E): Promise<E | null> {
    return this.e_con.updateEntity(args);
  }

  async getObjById(id: number): Promise<E | null> {
    return this.e_con.getEntityById(this.className, id);
  }

  async getObjList(search?: {
    [P in keyof E]?: E[P];
  }): Promise<E[]> {
    return this.e_con.getEntityList(this.className, search);
  }

  async delete(id: number): Promise<boolean> {
    return this.e_con.deleteEntityById(this.className, id);
  }
}
