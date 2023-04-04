import { JestLib, setupDevKernel, TestContext, TestKernel, XUtil } from '../dist/cjs/';

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

JestLib.jestStart();
JestLib.jestStore();
JestLib.jestCore();
JestLib.jestDb();
JestLib.jestEnd();
JestLib.jestOrm();
JestLib.jestUtils();
