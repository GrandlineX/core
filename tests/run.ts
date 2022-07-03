import * as Path from 'path';
import { createFolderIfNotExist, setupDevKernel, TestKernel } from '../src';
import WorkerFactory from '../src/utils/WorkerFactory';

const appName = 'TestKernel';
const appCode = 'tkernel';
const testEnv = Path.join(__dirname, '..');
const testPathData = Path.join(__dirname, '..', 'data');
const testPath = Path.join(__dirname, '..', 'data', 'config');

createFolderIfNotExist(testPathData);
createFolderIfNotExist(testPath);

// const kernel = new TestKernel(appName, appCode, testPath, testEnv);
//setupDevKernel(kernel);
// kernel.start();


const e= Array.from(Array(100).keys()).map((i)=>{
  return {
    id: i,
    name: `name ${i}`,
    age: i,
  };
})

let i = 0;
WorkerFactory.buildFromArray(
  3,
  e,
  async (data) => {
    return {
      i: data.i,
      dat: {
        ...data.dat,
        name:data.dat.name+"_new"
      },
    }
  }
).then(res=>console.log(res));
