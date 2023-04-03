/**
 * @name CoreKernel Main Module
 * @author David Nagy
 */
import CoreKernel, { CoreKernelProps } from './CoreKernel';
import CoreModule from './CoreModule';

import initHandler from './utils/initHandler';

export * from './dev';
export * from './classes';
export * from './database';
export * from './lib';
export * from './modules';
export * from './services';
export * from './utils';

export { CoreKernel, CoreModule, initHandler, CoreKernelProps };
export default CoreKernel;
