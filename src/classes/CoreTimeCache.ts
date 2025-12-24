import CoreLogChannel from './CoreLogChannel.js';
import CMap from './CoreMap.js';
import { IHaveLogger } from '../lib/index.js';

export type CachedData<T> = {
  last: number;
  ttl: number;
  data: T;
};
/**
 * A cache that stores values with a time‑to‑live (TTL) and automatically removes
 * expired entries after a configurable interval.
 *
 * The cache stores data objects wrapped in a `CachedData<T>` structure that
 * tracks the insertion time (`last`) and the remaining TTL. When an entry
 * expires, a background loop removes it and optionally logs the event.
 *
 * @template T The type of the cached data.
 */
export default class CoreTimeCache<T> extends CoreLogChannel {
  private cache = new CMap<string, CachedData<T>>();

  private readonly loopTime: number;

  private interval: NodeJS.Timeout | null = null;

  constructor(name: string, log: IHaveLogger | null = null, loopTime = 10000) {
    super(name, log);
    this.cache = new CMap<string, CachedData<T>>();
    this.loopTime = loopTime;
  }

  /**
   * Flash the cache
   */
  flash() {
    this.cache.clear();
  }

  private startBackground() {
    this.interval = setInterval(() => {
      const now = new Date().getTime();
      this.cache.deleteSelected((v, key) => {
        const res = v.last + v.ttl < now;
        if (res) {
          this.log(`clearing cache ${key}`);
        }
        return res;
      });
    }, this.loopTime);
  }

  /**
   *
   * @param key cache key
   * @param data data to cache
   * @param ttl time in ms
   */
  set(key: string, data: T, ttl = 120000) {
    this.setRaw(key, {
      last: new Date().getTime(),
      ttl,
      data,
    });
  }

  /**
   * Delete cached data
   * @param key
   */
  delete(key: string) {
    this.cache.delete(key);
  }

  /**
   * Get cached data
   * @param key
   */
  get(key: string): T | null {
    return this.getRaw(key)?.data ?? null;
  }

  /**
   * Has cached data
   * @param key
   */
  has(key: string) {
    return this.cache.has(key);
  }

  /**
   * Get raw cached data object
   * @param key
   */
  getRaw(key: string): CachedData<T> | null {
    return this.cache.get(key) || null;
  }

  /**
   * Get raw cached data object
   * @param key
   * @param data
   */
  setRaw(key: string, data: CachedData<T>): void {
    if (!this.interval) {
      this.startBackground();
    }
    this.cache.set(key, data);
  }

  /**
   * Extend the ttl of a cached data
   * @param key cache key
   * @param ttl add time in ms
   */
  extend(key: string, ttl = 120000): boolean {
    const el = this.cache.get(key);
    if (!el) {
      return false;
    }
    el.ttl += ttl;
    this.cache.set(key, el);
    return true;
  }

  /**
   * Stop the background cache cleaner
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
