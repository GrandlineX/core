import { setupDevKernel, TestContext, TestKernel, XUtil } from '../src';
const appName = 'TestKernel';
const appCode = 'tkernel';
const [testPath] = XUtil.setupEnvironment([__dirname, '..'],['data', 'config'],['test'])
const [kernel] = TestContext.getEntity(
  {
    kernel: new TestKernel(appName, appCode, testPath, __dirname),
    cleanUpPath:testPath,
    modLenth:2,
  }
);

setupDevKernel(kernel);

require('../src/dev/lib/start');
require('../src/dev/lib/store');
require('../src/dev/lib/core');
require('../src/dev/lib/dbcon');
require('../src/dev/lib/end');
require('../src/dev/lib/orm');
