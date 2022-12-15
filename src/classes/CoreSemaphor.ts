import crypto from 'crypto';

export type SemElement = [string, (value: any | PromiseLike<any>) => void];
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
