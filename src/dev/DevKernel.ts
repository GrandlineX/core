import CoreKernel from '../CoreKernel';
import { CoreCryptoClient } from '../modules';
import TestModule, { TestFc } from './testClass/TestModule';
import BridgeTestModule from './testClass/BridgeTestModule';
import { CoreLogger, LogLevel } from '../classes';
import { ICoreCClient } from '../lib';
import TestBaseModule from './testClass/TestBaseModule';

export function setupDevKernel<E extends CoreKernel<any>>(
  kernel: E,
  res?: TestFc
): E {
  kernel.setCryptoClient(
    new CoreCryptoClient(kernel, CoreCryptoClient.fromPW('testpw'))
  );
  kernel.setBaseModule(new TestBaseModule(kernel));
  kernel.addModule(new TestModule(kernel, res));
  kernel.addModule(new BridgeTestModule(kernel));
  kernel.setTriggerFunction('pre', async () => {
    kernel.verbose('pre');
  });
  kernel.setTriggerFunction('start', async () => {
    kernel.verbose('start');
  });
  kernel.setTriggerFunction('stop', async () => {
    kernel.verbose('stop');
  });
  kernel.setTriggerFunction('load', async () => {
    kernel.verbose('load');
  });
  kernel.setTriggerFunction('core-load', async () => {
    kernel.verbose('core-load');
  });
  kernel.getLogger().setLogLevel(LogLevel.VERBOSE);
  // (kernel.getLogger() as DefaultLogger).setNoColor(true);
  return kernel;
}

export class TestKernel extends CoreKernel<ICoreCClient> {
  testPath: string;

  constructor(
    appName: string,
    appCode: string,
    testPath: string,
    envFilePath: string,
    logger?: (kernel: CoreKernel<any>) => CoreLogger
  ) {
    super({
      appName,
      appCode,
      pathOverride: testPath,
      envFilePath,
      logger,
      loadFromLocalEnv: true,
    });
    this.testPath = testPath;
  }
}
