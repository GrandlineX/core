import CoreKernel from '../CoreKernel.js';

export default class TestContext {
  static entity: CoreKernel<any> | null;

  static cleanUpPath: string | null;

  static modLenth: number | null;

  /**
   *
   * @param ent testPath
   */
  static getEntity(ent?: {
    kernel: CoreKernel<any>;
    cleanUpPath?: string;
    modLenth?: number;
  }): [CoreKernel<any>, string | null, number | null] {
    if (this.entity) {
      return [this.entity, this.cleanUpPath, this.modLenth];
    }
    if (ent) {
      this.entity = ent.kernel;
      this.cleanUpPath = ent.cleanUpPath ?? null;
      this.modLenth = ent.modLenth ?? null;
    } else {
      throw new Error('NoKernelDefined');
    }

    return [this.entity, this.cleanUpPath, this.modLenth];
  }
}
