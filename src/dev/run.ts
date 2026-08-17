import * as process from 'process';
import { TestContext } from '.';
import { setupDevKernel, TestKernel } from './DevKernel';

const appName = 'TestKernel';
const appCode = 'tkernel';

const [kernel] = TestContext.getEntity({
  kernel: new TestKernel(appName, appCode, process.cwd()),
  cleanUp: true,
  modLength: 2,
});

setupDevKernel(kernel);

kernel.start();
