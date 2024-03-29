import { CoreDBCon, CoreDBUpdate } from '../../../classes/index.js';

export default class TestDBUpdate02 extends CoreDBUpdate<any> {
  constructor(db: CoreDBCon<any, any>) {
    super('1', '2', db);
  }

  async performe(): Promise<boolean> {
    this.getDb().debug(`${this.srcVersion}->${this.tarVersion}`);
    return true;
  }
}
