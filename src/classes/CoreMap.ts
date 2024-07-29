/**
 * Map extension
 */
export default class CMap<K, V> implements Map<K, V> {
  private readonly store;

  constructor(arr?: [K, V][]) {
    this.store = new Map<K, V>(arr);
    this.size = this.store.size;
  }

  private updateSize() {
    this.size = this.store.size;
  }

  clear(): void {
    this.store.clear();
    this.updateSize();
  }

  delete(key: K): boolean {
    const x = this.store.delete(key);
    this.updateSize();
    return x;
  }

  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: any,
  ): void {
    this.store.forEach(callbackfn, thisArg);
  }

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  set(key: K, value: V): this {
    this.store.set(key, value);
    this.updateSize();
    return this;
  }

  size: number;

  entries(): IterableIterator<[K, V]> {
    return this.store.entries();
  }

  keys(): IterableIterator<K> {
    return this.store.keys();
  }

  values(): IterableIterator<V> {
    return this.store.values();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.store[Symbol.iterator]();
  }

  [Symbol.toStringTag] = 'CoreMap';

  /**
   * Return a array based on each element in storage
   * @param mapper mapping function
   */
  map<T>(mapper: (value: V, key: K) => T): T[] {
    const out: T[] = [];
    this.forEach((v, k) => {
      out.push(mapper(v, k));
    });
    return out;
  }

  /**
   * Return an array with the values only
   */
  toValueArray(): V[] {
    return this.map<V>((v) => v);
  }

  /**
   * Return an array with the keys only
   */
  toKeyArray(): K[] {
    return this.map<K>((v, k) => k);
  }

  /**
   * Delete selected elements from the storage
   */
  deleteSelected(selector: (value: V, key: K) => boolean) {
    this.forEach((v, k) => {
      if (selector(v, k)) {
        this.delete(k);
      }
    });
  }

  /**
   * Merge another core-map in the existing, duplicated keys in the executing map will be overwritten
   */
  merge(map: CMap<K, V>, skipOverwrite = false) {
    map.forEach((value, key) => {
      if (!(skipOverwrite && this.has(key))) {
        this.set(key, value);
      }
    });
    return this;
  }
}
