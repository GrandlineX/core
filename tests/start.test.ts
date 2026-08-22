import { TestLib, setupDevKernel, TestContext, TestKernel } from '../src/dev';
import { AdvancedLogger } from '../src';

const appName = 'TestKernel';
const appCode = 'tkernel';
const [kernel] = TestContext.getEntity({
  kernel: new TestKernel(
    appName,
    appCode,
    import.meta.dirname,
    (k) =>
      new AdvancedLogger(
        k,
        {
          maxFiles: 2,
          fileFormat: 'string',
          maxFileSize: 1024 * 100,
        },
        'verbose',
      ),
  ),
  cleanUp: false,
  modLength: 2,
});

setupDevKernel(kernel);

TestLib.testStart();
TestLib.testService();
TestLib.testStore();
TestLib.testCore();
TestLib.testDb();
TestLib.testLogger();
TestLib.testEnd();
TestLib.testOrm();
TestLib.testUtils();
TestLib.testType();
