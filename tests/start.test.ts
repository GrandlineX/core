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

require('./lib/start');
require('./lib/core');
require('./lib/dbcon');
require('./lib/end');
require('./lib/orm');
