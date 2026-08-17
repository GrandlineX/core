import CoreKernel from '../CoreKernel';
import { CoreCryptoClient } from '../modules';
import TestModule, { type TestFc } from './testClass/TestModule';
import BridgeTestModule from './testClass/BridgeTestModule';
import { CoreLogger, LogLevel } from '../classes';
import type { ICoreCClient } from '../lib';
import TestBaseModule from './testClass/TestBaseModule';
import TestExtension from './testClass/client/TestExtension';

export function setupDevKernel<E extends CoreKernel<any>>(
  kernel: E,
  res?: TestFc,
): E {
  kernel.setCryptoClient(
    new CoreCryptoClient(kernel, CoreCryptoClient.fromPW('testpw')),
  );
  const mod = new TestModule(kernel, res);
  kernel.setBaseModule(new TestBaseModule(kernel));
  kernel.addModule(mod);
  kernel.addExtension('test', new TestExtension('test', mod));
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
  constructor(
    appName: string,
    appCode: string,
    envFilePath: string,
    logger?: (kernel: CoreKernel<any>) => CoreLogger,
  ) {
    super({
      appName,
      appCode,
      envFilePath,
      logger,
      loadFromLocalEnv: true,
      globalFolder: [
        {
          storeKey: 'dev',
          base: 'config',
          folderName: 'dev',
        },
        {
          storeKey: 'res',
          base: 'root',
          folderName: 'res',
        },
        {
          storeKey: 'res_image',
          base: 'root',
          folderName: 'res/image',
        },
      ],
    });
  }
}
