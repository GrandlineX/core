import { IBaseDBUpdate } from '../lib/index.js';
import CoreDBCon from './CoreDBCon.js';
import CoreDBPrefab from './CoreDBPrefab.js';

/**
 * Represents a migration step that updates the database schema or data from one
 * version to another.
 * The update logic is encapsulated in the {@link performe} method, which must
 * be implemented by subclasses.  Updates can be chained by setting a
 * successor via {@link setNext}.  The {@link update} method runs the current
 * step, persists the new version and then recursively triggers the next step.
 *
 * @template D - The database instance type. Must be either {@link CoreDBCon} or
 * {@link CoreDBPrefab}.
 * @implements {IBaseDBUpdate}
 */
export default abstract class CoreDBUpdate<
  D extends CoreDBCon<any, any> | CoreDBPrefab<any>,
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
    const perf = await this.perform();
    if (perf) {
      this.db.info(
        `Update DB from ${this.srcVersion} to ${this.tarVersion} successful`,
      );
    } else {
      throw this.db.lError(
        `Updating DB from ${this.srcVersion} to ${this.tarVersion} failed`,
      );
    }
    await this.db.setConfig('dbversion', this.tarVersion);
    const next = await this.updateNext();

    return perf && next;
  }

  abstract perform(): Promise<boolean>;

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
