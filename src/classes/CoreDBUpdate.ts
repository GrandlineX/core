import { IBaseDBUpdate } from '../lib';
import CoreDBCon from './CoreDBCon';

export default abstract class CoreDBUpdate<D, T> implements IBaseDBUpdate {
  srcVersion: string;

  tarVersion: string;

  private readonly db: CoreDBCon<D, T>;

  private nextUpdate: CoreDBUpdate<D, T> | null;

  protected constructor(
    srcVersion: string,
    tarVersion: string,
    db: CoreDBCon<D, T>
  ) {
    this.srcVersion = srcVersion;
    this.tarVersion = tarVersion;
    this.db = db;
    this.nextUpdate = null;
  }

  async update(): Promise<boolean> {
    const perf = await this.performe();
    if (perf) {
      this.db.log(
        `Update DB from ${this.srcVersion} to ${this.tarVersion} successful`
      );
    } else {
      throw this.db.lError(
        `Updating DB from ${this.srcVersion} to ${this.tarVersion} failed`
      );
    }
    const next = await this.updateNext();

    return perf && next;
  }

  abstract performe(): Promise<boolean>;

  async updateNext(): Promise<boolean> {
    if (this.nextUpdate !== null) {
      return this.nextUpdate.update();
    }
    return true;
  }

  setNext(db: CoreDBUpdate<D, T>): void {
    this.nextUpdate = db;
  }

  find(version: string): CoreDBUpdate<D, T> | null {
    if (this.srcVersion === version) {
      return this;
    }
    if (this.nextUpdate !== null) {
      return this.nextUpdate.find(version);
    }
    return null;
  }

  getDb(): CoreDBCon<D, T> {
    return this.db;
  }

  getSource(): string {
    return this.srcVersion;
  }
}
