import crypto from 'crypto';

export type SemElement = [string, (value: any | PromiseLike<any>) => void];

/**
 * A semaphore implementation that limits the number of concurrent operations.
 * <p>
 * The semaphore maintains an internal queue of pending requests and a set of
 * active tokens. When the number of active tokens is below the configured
 * maximum, the next request in the queue is granted immediately. Each granted
 * request receives a release callback; calling this callback frees a token
 * and triggers the next pending request.
 * <p>
 * Internally the semaphore tracks active tokens in a {@link Map} and pending
 * requests in an array. The {@link request} method returns a {@link Promise}
 * that resolves to a release function. The release function removes the
 * token from the active set and potentially starts the next pending request.
 * <p>
 * The semaphore is thread‑safe with respect to the event loop, as all state
 * mutations occur synchronously within the call stack of the {@link request}
 * and {@link release} methods.
 *
 * @param {number} [max=1] - The maximum number of concurrent operations allowed.
 */
export class CoreSemaphor {
  private curQueue: Map<string, SemElement>;

  private readonly max: number;

  private callbackQueue: SemElement[];

  constructor(max = 1) {
    this.curQueue = new Map();
    this.callbackQueue = [];
    this.max = max;
    this.release = this.release.bind(this);
  }

  hasFree() {
    return this.curQueue.size < this.max;
  }

  async request(): Promise<() => void> {
    const uuid = crypto.randomUUID();
    return new Promise((resolve) => {
      this.callbackQueue.push([uuid, resolve]);
      this.startNext();
    });
  }

  private startNext() {
    if (this.hasFree()) {
      const el = this.callbackQueue.shift();
      if (el) {
        const [uuid, resolve] = el;
        this.curQueue.set(uuid, el);
        resolve(() => {
          this.release(uuid);
        });
        this.startNext();
      }
    }
  }

  private release(uuid: string) {
    if (this.curQueue.has(uuid)) {
      this.curQueue.delete(uuid);
    }
    this.startNext();
  }
}
