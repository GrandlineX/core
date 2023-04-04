import { CoreSemaphor } from './CoreSemaphor.js';

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
