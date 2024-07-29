import { clearInterval } from 'timers';
import { CoreCache, IEntity } from '../../classes/index.js';
import { ICoreKernelModule } from '../../lib/index.js';

export default class InMemCache extends CoreCache {
  keyMap: Map<string, string>;

  eMap: Map<string, Map<string, any>>;

  loop: ReturnType<typeof setInterval> | null;

  deleteTime?: number;

  constructor(
    module: ICoreKernelModule<any, any, any, any, any>,
    deleteTime?: number,
  ) {
    super('inMemCache', module);
    this.keyMap = new Map<string, string>();
    this.eMap = new Map<string, Map<string, any>>();
    this.loop = null;
    this.deleteTime = deleteTime;
    this.flash = this.flash.bind(this);
  }

  async clearAll(): Promise<void> {
    this.keyMap.clear();
  }

  async clearAllE(className: string): Promise<void> {
    this.eMap.get(className)?.clear();
  }

  async delete(key: string): Promise<void> {
    this.keyMap.delete(key);
  }

  async deleteE(className: string, e_id: string): Promise<boolean> {
    return this.eMap.get(className)?.delete(e_id) || true;
  }

  async exist(key: string): Promise<boolean> {
    return this.keyMap.has(key);
  }

  async get(key: string): Promise<string | null> {
    return this.keyMap.get(key) ?? null;
  }

  async getE<E extends IEntity>(
    className: string,
    e_id: string,
  ): Promise<E | null> {
    return this.eMap.get(className)?.get(e_id);
  }

  async set(key: string, val: string): Promise<void> {
    this.keyMap.set(key, val);
  }

  async setE<E extends IEntity>(className: string, val: E): Promise<void> {
    let cur = this.eMap.get(className);

    if (!cur) {
      cur = new Map<string, any>();
      this.eMap.set(className, cur);
    }
    cur.set(val.e_id, val);
  }

  flash() {
    this.debug(`Clear cache:${this.channel}`);
    this.keyMap.clear();
    this.eMap.clear();
  }

  async start(): Promise<void> {
    if (this.deleteTime) {
      this.loop = setInterval(this.flash, this.deleteTime);
    }
    this.debug(`Init cache:${this.channel}`);
  }

  async stop(): Promise<void> {
    if (this.loop) {
      clearInterval(this.loop);
    }
    await this.clearAll();
    const iter = this.eMap.keys();
    let key = iter.next();
    while (!key.done || key.value !== undefined) {
      await this.clearAllE(key.value);
      key = iter.next();
    }
    this.flash();
  }
}
