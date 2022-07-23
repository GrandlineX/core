import { CoreDBCon, CoreDBUpdate } from '../../../classes';

export default class TestDBUpdate01 extends CoreDBUpdate<any> {
  constructor(db: CoreDBCon<any, any>) {
    super('0', '1', db);
  }

  async performe(): Promise<boolean> {
    this.getDb().log(`${this.srcVersion}->${this.tarVersion}`);
    return true;
  }
}
