import * as process from 'process';
import { TestContext } from './index.js';
import { setupDevKernel, TestKernel } from './DevKernel.js';

const appName = 'TestKernel';
const appCode = 'tkernel';

const [kernel] = TestContext.getEntity({
  kernel: new TestKernel(appName, appCode, process.cwd()),
  cleanUp: true,
  modLength: 2,
});

setupDevKernel(kernel);

kernel.start();
