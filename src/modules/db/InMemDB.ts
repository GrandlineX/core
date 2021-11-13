import CoreDBCon from '../../classes/CoreDBCon';
import { ConfigType, ICoreKernelModule, RawQuery } from '../../lib';
import CoreEntity from '../../classes/CoreEntity';

export default class InMemDB extends CoreDBCon<Map<string, CoreEntity[]>, any> {
  map: Map<string, ConfigType>;

  e_map: Map<string, CoreEntity[]>;

  constructor(module: ICoreKernelModule<any, any, any, any, any>) {
    super('0', 'main', module);
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

  async execScripts(list: RawQuery[]): Promise<any[]> {
    return [];
  }

  async getConfig(key: string): Promise<ConfigType | undefined> {
    return this.map.get(key);
  }

  async initEntity<E extends CoreEntity>(entity: E): Promise<boolean> {
    this.e_map.set(entity.constructor.name, []);
    return true;
  }

  async getEntityById<E extends CoreEntity>(
    className: string,
    id: number
  ): Promise<E | null> {
    const table = this.e_map.get(className);
    if (!table) {
      return null;
    }
    const temp = table.find((el) => el.e_id === id);
    if (!temp) {
      return null;
    }
    return temp as E;
  }

  async createEntity<E extends CoreEntity>(entity: E): Promise<E | null> {
    const table = this.e_map.get(entity.constructor.name);
    if (!table) {
      return null;
    }
    table.push(entity);
    return entity;
  }

  async deleteEntityById(className: string, id: number): Promise<boolean> {
    const table = this.e_map.get(className);
    if (!table) {
      return false;
    }
    const temp = table.filter((el) => el.e_id !== id);
    this.e_map.set(className, temp);
    return true;
  }

  async updateEntity<E extends CoreEntity>(entity: E): Promise<E | null> {
    const table = this.e_map.get(entity.constructor.name);
    if (!table || !entity.e_id) {
      return null;
    }
    await this.deleteEntityById(entity.constructor.name, entity.e_id);
    await this.createEntity<E>(entity);
    return entity;
  }

  async getEntityList<E extends CoreEntity>(
    className: string,
    search: { [P in keyof E]?: E[P] }
  ): Promise<E[]> {
    const table = this.e_map.get(className);
    if (!table) {
      return [];
    }
    if (search) {
      return (table as E[]).filter((row) => {
        const keys: (keyof E)[] = Object.keys(search) as (keyof E)[];
        for (const key of keys) {
          if (row[key] !== search[key]) {
            return false;
          }
        }
        return true;
      });
    }
    return table as E[];
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
