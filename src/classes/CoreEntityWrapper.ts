import CoreEntity from './CoreEntity';
import { ICoreEntityHandler } from '../lib/EntityRelationTypes';
import { ColumnPropMap, ColumnProps, getColumnMeta } from './annotation';

export default class CoreEntityWrapper<E extends CoreEntity> {
  protected e_con: ICoreEntityHandler;

  protected className: string;

  getIns: () => E;

  propMap: ColumnPropMap<E>;

  constructor(con: ICoreEntityHandler, name: string, getIns: () => E) {
    this.e_con = con;
    this.className = name;
    this.getIns = getIns;
    this.propMap = this.genPropMap();
  }

  async createObject(args: E): Promise<E | null> {
    return this.e_con.createEntity<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      args
    );
  }

  async updateObject(args: E): Promise<E | null> {
    return this.e_con.updateEntity<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      args
    );
  }

  async getObjById(id: number): Promise<E | null> {
    return this.e_con.getEntityById<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      id
    );
  }

  async getObjList(search?: {
    [P in keyof E]?: E[P];
  }): Promise<E[]> {
    return this.e_con.getEntityList<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      search
    );
  }

  async findObj(search: {
    [P in keyof E]?: E[P];
  }): Promise<E | null> {
    return this.e_con.findEntity<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      search
    );
  }

  async delete(id: number): Promise<boolean> {
    return this.e_con.deleteEntityById(this.className, id);
  }

  async init(): Promise<boolean> {
    return this.e_con.initEntity(this.className, this.getIns());
  }

  getPropMap(): ColumnPropMap<E> {
    return this.propMap;
  }

  private genPropMap(): ColumnPropMap<E> {
    const map = new Map<keyof E, ColumnProps>();
    const ent: E = this.getIns();
    const keys = Object.keys(ent) as (keyof E)[];
    keys.forEach((key) => {
      map.set(key, getColumnMeta(ent, key) as ColumnProps);
    });
    return map;
  }
}
