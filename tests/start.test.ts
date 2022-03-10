import * as Path from 'path';
import { createFolderIfNotExist, setupDevKernel, TestKernel } from '../src';

const appName = 'TestKernel';
const appCode = 'tkernel';
const msiPath = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');

createFolderIfNotExist(msiPath);
createFolderIfNotExist(testPath);

const kernel = TestKernel.getEntity(
  new TestKernel(appName, appCode, testPath, __dirname)
);

setupDevKernel(kernel);

require('../src/dev/lib/start');
require('../src/dev/lib/core');
require('../src/dev/lib/dbcon');
require('../src/dev/lib/end');
require('../src/dev/lib/orm');
