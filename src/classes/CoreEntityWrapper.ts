import CoreEntity from './CoreEntity.js';
import {
  ICoreCache,
  ICoreEntityHandler,
  QInterface,
  QInterfaceSearch,
} from '../lib/index.js';
import {
  ColumnPropMap,
  ColumnProps,
  EProperties,
  EUpDateProperties,
  getColumnMeta,
} from './annotation/index.js';
import { EntityValidator } from '../utils/index.js';
import CMap from './CoreMap.js';

export default class CoreEntityWrapper<E extends CoreEntity> {
  getIns: () => E;

  propMap: ColumnPropMap<E>;

  cache: ICoreCache | null;

  protected e_con: ICoreEntityHandler;

  protected className: string;

  constructor(
    con: ICoreEntityHandler,
    name: string,
    getIns: () => E,
    noCache = false,
  ) {
    this.e_con = con;
    this.className = name;
    this.getIns = getIns;
    this.propMap = this.genPropMap();
    this.cache = !noCache ? con.getCache() : null;
  }

  async createObject(args: EProperties<E>): Promise<E> {
    if (
      !EntityValidator.validateObj(this.propMap, this.className, args, false)
    ) {
      throw this.e_con.lError(`validation failed for ${this.className} create`);
    }
    return this.e_con.createEntity<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      args,
    );
  }

  async updateObject(
    e_id: string,
    args: EUpDateProperties<E>,
  ): Promise<boolean> {
    if (
      !EntityValidator.validateObj(this.propMap, this.className, args, true)
    ) {
      throw this.e_con.lError(`validation failed for ${this.className} update`);
    }
    await this.cache?.deleteE(this.className, e_id);

    return this.e_con.updateEntity<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      e_id,
      args,
    );
  }

  async updateObjectBulk(
    e_id: string[],
    args: EUpDateProperties<E>,
  ): Promise<boolean> {
    if (
      !EntityValidator.validateObj(this.propMap, this.className, args, true)
    ) {
      throw this.e_con.lError(`validation failed for ${this.className} update`);
    }
    for (const id of e_id) {
      await this.cache?.deleteE(this.className, id);
    }

    return this.e_con.updateBulkEntity<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      e_id,
      args,
    );
  }

  async getObjById(id: string): Promise<E | null> {
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
      id,
    );
    if (res && this.cache) {
      await this.cache.setE<E>(this.className, res);
    }
    return res;
  }

  async getObjByIdBulk(id: string[]): Promise<E[]> {
    const map = new CMap<string, E>();
    if (this.cache) {
      for (const i of id) {
        const has = await this.cache.getE<E>(this.className, i);
        if (has) {
          map.set(i, has);
        }
      }
    }
    const missing = id.filter((i) => !map.has(i));
    const res = await this.e_con.getEntityBulkById<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      missing,
    );
    for (const r of res) {
      map.set(r.e_id, r);
      if (this.cache) {
        await this.cache.setE<E>(this.className, r);
      }
    }
    return map.toValueArray();
  }

  async getObjList(query?: QInterface<E>): Promise<E[]> {
    return this.e_con.getEntityList<E>({
      config: {
        className: this.className,
        meta: this.propMap,
      },
      ...query,
    });
  }

  async findObj(search: QInterfaceSearch<E>): Promise<E | null> {
    return this.e_con.findEntity<E>(
      {
        className: this.className,
        meta: this.propMap,
      },
      search,
    );
  }

  async delete(e_id: string): Promise<boolean> {
    await this.cache?.deleteE(this.className, e_id);
    return this.e_con.deleteEntityById(this.className, e_id);
  }

  async deleteBulk(e_id: string[]): Promise<boolean> {
    for (const id of e_id) {
      await this.cache?.deleteE(this.className, id);
    }
    return this.e_con.deleteEntityBulkById(this.className, e_id);
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
