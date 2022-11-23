import { IBaseDBUpdate } from '../lib';
import CoreDBCon from './CoreDBCon';
import CoreDBPrefab from './CoreDBPrefab';

export default abstract class CoreDBUpdate<
  D extends CoreDBCon<any, any> | CoreDBPrefab<any>
> implements IBaseDBUpdate
{
  srcVersion: string;

  tarVersion: string;

  private readonly db: D;

  private nextUpdate: CoreDBUpdate<D> | null;

  protected constructor(srcVersion: string, tarVersion: string, db: D) {
    this.srcVersion = srcVersion;
    this.tarVersion = tarVersion;
    this.db = db;
    this.nextUpdate = null;
  }

  async update(): Promise<boolean> {
    const perf = await this.performe();
    if (perf) {
      this.db.info(
        `Update DB from ${this.srcVersion} to ${this.tarVersion} successful`
      );
    } else {
      throw this.db.lError(
        `Updating DB from ${this.srcVersion} to ${this.tarVersion} failed`
      );
    }
    await this.db.setConfig('dbversion', this.tarVersion);
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

  setNext(db: CoreDBUpdate<D>): void {
    this.nextUpdate = db;
  }

  find(version: string): CoreDBUpdate<D> | null {
    if (this.srcVersion === version) {
      return this;
    }
    if (this.nextUpdate !== null) {
      return this.nextUpdate.find(version);
    }
    return null;
  }

  getDb(): D {
    return this.db;
  }

  getSource(): string {
    return this.srcVersion;
  }
}
