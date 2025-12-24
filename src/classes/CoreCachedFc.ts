import { CoreSemaphor } from './CoreSemaphor.js';

/**
 * A cache wrapper around an asynchronous function that stores the result
 * for a specified timeout period. Subsequent calls within the timeout
 * return the cached value instead of invoking the function again.
 *
 * @template T The type of the value returned by the wrapped function.
 */
export default class CoreCachedFc<T> {
  fc: () => Promise<T>;

  timeOut: number;

  data: T | null;

  lock: CoreSemaphor;

  constructor(timeout: number, fc: () => Promise<T>) {
    this.fc = fc;
    this.data = null;
    this.timeOut = timeout;
    this.lock = new CoreSemaphor();
  }

  async get() {
    const release = await this.lock.request();
    if (!this.data) {
      this.data = await this.fc();
      setTimeout(() => {
        this.data = null;
      }, this.timeOut);
    }
    release();
    return this.data;
  }
}
