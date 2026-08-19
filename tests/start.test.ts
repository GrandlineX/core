import { TestLib, setupDevKernel, TestContext, TestKernel } from '../src/dev';
import { AdvancedLogger } from '../src';

const appName = 'TestKernel';
const appCode = 'tkernel';
const [kernel] = TestContext.getEntity({
  kernel: new TestKernel(
    appName,
    appCode,
    import.meta.dirname,
    (k) => new AdvancedLogger(k, 'string', 'verbose'),
  ),
  cleanUp: true,
  modLength: 2,
});

setupDevKernel(kernel);

TestLib.testStart();
TestLib.testService();
TestLib.testStore();
TestLib.testCore();
TestLib.testDb();
TestLib.testEnd();
TestLib.testOrm();
TestLib.testUtils();
TestLib.testType();
