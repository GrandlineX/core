import { CoreDBCon, CoreDBUpdate } from '../../../classes/index.js';

export default class TestDBUpdate01 extends CoreDBUpdate<any> {
  constructor(db: CoreDBCon<any, any>) {
    super('0', '1', db);
  }

  async perform(): Promise<boolean> {
    this.getDb().debug(`${this.srcVersion}->${this.tarVersion}`);
    return true;
  }
}
