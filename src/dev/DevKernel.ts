import CoreKernel from '../CoreKernel';
import { CoreCryptoClient } from '../modules';
import TestBaseMod from './testClass/TestBaseMod';
import TestModule from './testClass/TestModule';
import BridgeTestModule from './testClass/BridgeTestModule';
import { LogLevel } from '../classes';
import { ICoreCClient } from '../lib';

export function setupDevKernel<E extends CoreKernel<any>>(kernel: E): E {
  kernel.setBaseModule(new TestBaseMod('testbase2', kernel));
  kernel.setCryptoClient(
    new CoreCryptoClient(CoreCryptoClient.fromPW('testpw'))
  );
  kernel.addModule(new TestModule(kernel));
  kernel.addModule(new BridgeTestModule(kernel));
  kernel.setTriggerFunction('pre', async () => {});
  kernel.setTriggerFunction('start', async () => {});
  kernel.setTriggerFunction('stop', async () => {});
  kernel.setTriggerFunction('load', async () => {});
  kernel.getLogger().setLogLevel(LogLevel.VERBOSE);
  return kernel;
}

export class TestKernel extends CoreKernel<ICoreCClient> {
  static entity: TestKernel | null;

  testPath: string;

  constructor(
    appName: string,
    appCode: string,
    testPath: string,
    envFilePath: string
  ) {
    super({
      appName,
      appCode,
      pathOverride: testPath,
      envFilePath,
    });
    this.testPath = testPath;
  }

  static getEntity(ent?: TestKernel): TestKernel {
    if (this.entity) {
      return this.entity;
    }
    if (ent) {
      this.entity = ent;
    } else {
      throw new Error('NoKernelDefined');
    }

    return this.entity;
  }
}
