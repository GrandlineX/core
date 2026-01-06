import * as process from 'process';
import { XUtil } from '../utils/index.js';
import { TestContext } from './index.js';
import { setupDevKernel, TestKernel } from './DevKernel.js';

const appName = 'TestKernel';
const appCode = 'tkernel';
const [testPath] = XUtil.setupEnvironment(
  [process.cwd()],
  ['data', 'config'],
  ['test'],
);
const [kernel] = TestContext.getEntity({
  kernel: new TestKernel(appName, appCode, testPath, process.cwd()),
  cleanUpPath: testPath,
  modLenth: 2,
});

setupDevKernel(kernel);

kernel.start();
