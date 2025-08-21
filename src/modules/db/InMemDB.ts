import CoreDBCon from '../../classes/CoreDBCon.js';
import {
  ConfigType,
  ICoreKernelModule,
  isQInterfaceSearchAdvanced,
  isQInterfaceSearchAdvancedArr,
  QInterfaceSearch,
  QInterfaceSearchAdvanced,
  QueryInterface,
  RawQuery,
} from '../../lib/index.js';
import CoreEntity from '../../classes/CoreEntity.js';
import {
  EntityConfig,
  EUpDateProperties,
  IEntity,
} from '../../classes/index.js';

function aFilter<E extends CoreEntity>(
  e: E[keyof E],
  s: QInterfaceSearchAdvanced<QInterfaceSearch<E>, keyof E>,
) {
  switch (s.mode) {
    case 'equals':
      return e === s.value;
    case 'not':
      return e !== s.value;
    case 'like':
      if (typeof e !== 'string' || typeof s.value !== 'string') {
        return false;
      }
      if (e.includes(s.value)) {
        return true;
      }
      break;
    case 'smallerThan':
      if (typeof e !== 'number' || typeof s.value !== 'number') {
        return false;
      }
      if (e < s.value) {
        return true;
      }
      break;
    case 'greaterThan':
      if (typeof e !== 'number' || typeof s.value !== 'number') {
        return false;
      }
      if (e > s.value) {
        return true;
      }
      break;
    default:
  }
  return false;
}
function eFilter<E extends CoreEntity>(row: E, search: QInterfaceSearch<E>) {
  const keys: (keyof E)[] = Object.keys(search) as (keyof E)[];
  for (const key of keys) {
    const r = row[key];
    const s = search[key];
    if (isQInterfaceSearchAdvanced(s)) {
      return aFilter(r, s);
    }
    if (isQInterfaceSearchAdvancedArr(s)) {
      return s.every((e) => aFilter(r, e));
    }
    if (row[key] === s) {
      return true;
    }
  }
  return false;
}

export default class InMemDB extends CoreDBCon<Map<string, CoreEntity[]>, any> {
  map: Map<string, ConfigType>;

  e_map: Map<string, CoreEntity[]>;

  private dbCounter: number;

  constructor(module: ICoreKernelModule<any, any, any, any, any>) {
    super('0', 'main', module);
    this.dbCounter = 0;
    this.map = new Map<string, ConfigType>();
    this.e_map = new Map<string, CoreEntity[]>();
  }

  async configExist(key: string): Promise<boolean> {
    return this.map.has(key);
  }

  async connect(): Promise<boolean> {
    this.setConnected();
    this.setNew(true);
    return true;
  }

  async disconnect(): Promise<boolean> {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execScripts(list: RawQuery[]): Promise<any[]> {
    return [];
  }

  async getConfig(key: string): Promise<ConfigType | undefined> {
    return this.map.get(key);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async initEntity<E extends CoreEntity>(className: string): Promise<boolean> {
    this.e_map.set(className, []);
    return true;
  }

  async getEntityById<E extends CoreEntity>(
    config: EntityConfig<E>,
    e_id: string,
  ): Promise<E | null> {
    const table = this.e_map.get(config.className);
    if (!table) {
      return null;
    }
    const temp = table.find((el) => el.e_id === e_id);
    if (!temp) {
      return null;
    }
    return temp as E;
  }

  async getEntityBulkById<E extends CoreEntity>(
    config: EntityConfig<E>,
    e_id: string[],
  ): Promise<E[]> {
    const table = this.e_map.get(config.className);
    if (!table) {
      return [];
    }
    const temp = table.filter((el) => e_id.includes(el.e_id));
    return temp as E[];
  }

  async createEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    entity: E,
  ): Promise<E> {
    const clone = entity;
    const table = this.e_map.get(config.className);
    if (!table) {
      throw this.lError('Cant create Entity');
    }
    table.push(clone);
    return clone;
  }

  async deleteEntityById(className: string, e_id: string): Promise<boolean> {
    const table = this.e_map.get(className);
    if (!table) {
      return false;
    }
    const temp = table.filter((el) => el.e_id !== e_id);
    this.e_map.set(className, temp);
    return true;
  }

  async deleteEntityBulkById(
    className: string,
    e_id: string[],
  ): Promise<boolean> {
    const table = this.e_map.get(className);
    if (!table) {
      return false;
    }
    const temp = table.filter((el) => !e_id.includes(el.e_id));
    this.e_map.set(className, temp);
    return true;
  }

  async updateEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    e_id: string,
    entity: EUpDateProperties<E>,
  ): Promise<boolean> {
    const table = this.e_map.get(config.className);
    if (!table) {
      throw this.lError('Cant create Entity');
    }
    const target: any = table.find((el) => {
      return el.e_id === e_id;
    });

    if (!target) {
      throw this.lError('Cant create Entity');
    }
    const keys = Object.keys(entity) as (keyof EUpDateProperties<E>)[];
    for (const key of keys) {
      target[key] = entity[key];
    }

    return true;
  }

  async updateBulkEntity<E extends IEntity>(
    config: EntityConfig<E>,
    e_id: string[],
    entity: EUpDateProperties<E>,
  ): Promise<boolean> {
    return (
      await Promise.all(
        e_id.map((e) => this.updateEntity<E>(config, e, entity)),
      )
    ).every((el) => el);
  }

  async getEntityList<E extends CoreEntity>(
    query: QueryInterface<E>,
  ): Promise<E[]> {
    const { config, limit, search, order, offset } = query;
    const table = this.e_map.get(config.className);
    if (
      !table ||
      limit === 0 ||
      (offset !== undefined && offset > table.length)
    ) {
      return [];
    }
    let out: E[];
    if (search) {
      out = (table as E[]).filter((row) => eFilter(row, search));
    } else {
      out = table as E[];
    }
    const odw = order ? order[0] : null;
    if (odw && odw.key === 'e_id' && odw.order === 'DESC') {
      out = out.reverse();
    }
    if (!!limit && limit > 0) {
      const off = offset ?? 0;
      const end = off === 0 ? limit : limit + off;
      return out.slice(off, end);
    }
    return out;
  }

  async findEntity<E extends CoreEntity>(
    config: EntityConfig<E>,
    search: { [P in keyof E]?: E[P] | undefined },
  ): Promise<E | null> {
    const table = this.e_map.get(config.className);
    if (!table) {
      return null;
    }

    return (table as E[]).find((row) => eFilter(row, search)) ?? null;
  }

  getRawDBObject(): any {
    return {
      e_map: this.e_map,
      map: this.map,
    };
  }

  async initNewDB(): Promise<void> {
    await this.setConfig('dbversion', this.dbVersion);
  }

  async removeConfig(key: string): Promise<void> {
    this.map.delete(key);
  }

  async setConfig(key: string, value: string): Promise<boolean> {
    this.map.set(key, {
      c_value: value,
      c_key: key,
    });
    return true;
  }
}
