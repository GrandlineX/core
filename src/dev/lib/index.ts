import testCore from './core';
import testDb from './dbcon';
import testStart from './start';
import testOrm from './orm';
import testStore from './store';
import testEnd from './end';
import testUtils from './util';
import testType from './type';
import testService from './service';
import testLogger from './logger';

const TestLib = {
  testCore,
  testService,
  testDb,
  testStart,
  testOrm,
  testStore,
  testEnd,
  testUtils,
  testType,
  testLogger,
};

export default TestLib;
