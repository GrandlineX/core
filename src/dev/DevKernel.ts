import CoreKernel from '../CoreKernel.js';
import { CoreCryptoClient } from '../modules/index.js';
import TestModule, { TestFc } from './testClass/TestModule.js';
import BridgeTestModule from './testClass/BridgeTestModule.js';
import { CoreLogger, LogLevel } from '../classes/index.js';
import { ICoreCClient } from '../lib/index.js';
import TestBaseModule from './testClass/TestBaseModule.js';

export function setupDevKernel<E extends CoreKernel<any>>(
  kernel: E,
  res?: TestFc,
): E {
  kernel.setCryptoClient(
    new CoreCryptoClient(kernel, CoreCryptoClient.fromPW('testpw')),
  );
  kernel.setBaseModule(new TestBaseModule(kernel));
  kernel.addModule(new TestModule(kernel, res));
  kernel.addModule(new BridgeTestModule(kernel));
  kernel.on('pre', async () => {
    kernel.verbose('pre');
  });
  kernel.on('start', async () => {
    kernel.verbose('start');
  });
  kernel.on('stop', async () => {
    kernel.verbose('stop');
  });
  kernel.on('load', async () => {
    kernel.verbose('load');
  });
  kernel.on('core-load', async () => {
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
    logger?: (kernel: CoreKernel<any>) => CoreLogger,
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
