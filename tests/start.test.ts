import * as Path from 'path';
import { createFolderIfNotExist, setupDevKernel, TestContext, TestKernel } from '../src';

const appName = 'TestKernel';
const appCode = 'tkernel';
const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');

createFolderIfNotExist(msiPath);
createFolderIfNotExist(testPath);

const [kernel] = TestContext.getEntity(
  {
    kernel: new TestKernel(appName, appCode, testPath, __dirname),
    cleanUpPath:testPath
  }
);

setupDevKernel(kernel);

require('../src/dev/lib/start');
require('../src/dev/lib/store');
require('../src/dev/lib/core');
require('../src/dev/lib/dbcon');
require('../src/dev/lib/end');
require('../src/dev/lib/orm');
