import { JestLib, setupDevKernel, TestContext, TestKernel } from '../index.js';

const appName = 'TestKernel';
const appCode = 'tkernel';
const [kernel] = TestContext.getEntity(
  {
    kernel: new TestKernel(appName, appCode, __dirname),
    cleanUp :true,
    modLength:2,
  }
);

setupDevKernel(kernel);

JestLib.jestStart();
JestLib.jestStore();
JestLib.jestCore();
JestLib.jestDb();
JestLib.jestEnd();
JestLib.jestOrm();
JestLib.jestUtils();
JestLib.jestType();
JestLib.jestCoverage();
