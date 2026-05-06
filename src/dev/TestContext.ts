import CoreKernel from '../CoreKernel.js';

export default class TestContext {
  static entity: CoreKernel<any> | null;

  static cleanUp: boolean;

  static modLength: number | null;

  /**
   *
   * @param ent testPath
   */
  static getEntity(ent?: {
    kernel: CoreKernel<any>;
    cleanUp?: boolean;
    modLength?: number;
  }): [CoreKernel<any>, boolean, number | null] {
    if (this.entity) {
      return [this.entity, this.cleanUp, this.modLength];
    }
    if (ent) {
      this.entity = ent.kernel;
      this.cleanUp = ent.cleanUp ?? false;
      this.modLength = ent.modLength ?? null;
    } else {
      throw new Error('NoKernelDefined');
    }

    return [this.entity, this.cleanUp, this.modLength];
  }
}
