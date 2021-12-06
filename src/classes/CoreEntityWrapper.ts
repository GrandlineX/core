import CoreEntity from './CoreEntity';
import { ICoreEntityHandler, ICoreCache } from '../lib';
import {
  ColumnPropMap,
  ColumnProps,
  EOrderBy,
  EProperties,
  EUpDateProperties,
  getColumnMeta,
} from './annotation';

export default class CoreEntityWrapper<E extends CoreEntity> {
  protected e_con: ICoreEntityHandler;

  protected className: string;

  getIns: () => E;

  propMap: ColumnPropMap<E>;

  cache: ICoreCache | null;

  constructor(con: ICoreEntityHandler, name: string, getIns: () => E) {
    this.e_con = con;
    this.className = name;
    this.getIns = getIns;
    this.propMap = this.genPropMap();
    this.cache = con.getCache();
  }

  async createObject(args: EProperties<E>): Promise<E> {
    return this.e_con.createEntity<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      args
    );
  }

  async updateObject(
    e_id: number,
    args: EUpDateProperties<E>
  ): Promise<boolean> {
    await this.cache?.deleteE(this.className, e_id);

    return this.e_con.updateEntity<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      e_id,
      args
    );
  }

  async getObjById(id: number): Promise<E | null> {
    if (this.cache) {
      const has = await this.cache.getE<E>(this.className, id);
      if (has) {
        return has;
      }
    }
    const res = await this.e_con.getEntityById<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      id
    );
    if (res && this.cache) {
      await this.cache.setE<E>(this.className, res);
    }
    return res;
  }

  async getObjList(
    search?: {
      [P in keyof E]?: E[P];
    },
    limit?: number,
    order?: EOrderBy<E>
  ): Promise<E[]> {
    return this.e_con.getEntityList<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      limit,
      search,
      order
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

  async delete(e_id: number): Promise<boolean> {
    return this.e_con.deleteEntityById(this.className, e_id);
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
