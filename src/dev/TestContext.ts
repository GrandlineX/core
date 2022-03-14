import CoreKernel from '../CoreKernel';

export default class TestContext {
  static entity: CoreKernel<any> | null;

  static cleanUpPath: string | null;

  /**
   *
   * @param ent testPath
   */
  static getEntity(ent?: {
    kernel: CoreKernel<any>;
    cleanUpPath?: string;
  }): [CoreKernel<any>, string | null] {
    if (this.entity) {
      return [this.entity, this.cleanUpPath];
    }
    if (ent) {
      this.entity = ent.kernel;
      this.cleanUpPath = ent.cleanUpPath || null;
    } else {
      throw new Error('NoKernelDefined');
    }

    return [this.entity, this.cleanUpPath];
  }
}
