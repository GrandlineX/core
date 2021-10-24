import * as Path from 'path';
import { config } from 'dotenv';
import Kernel, { createFolderIfNotExist } from '../src';

config();

const appName = 'TestKernel';
const appCode = 'tkernel';
const testPathData = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');


createFolderIfNotExist(testPathData);
createFolderIfNotExist(testPath);

class TestKernel extends Kernel<any>{
  constructor() {
    super(appName,appCode,testPath);
  }
}
const kernel = new TestKernel();



kernel.start();
