/**
 * @name CoreKernel Main Module
 * @author David Nagy
 */
import CoreKernel, { type CoreKernelProps } from './CoreKernel';
import CoreModule from './CoreModule';

import initHandler from './utils/initHandler';

export * from './classes';
export * from './database';
export * from './lib';
export * from './modules';
export * from './services';
export * from './utils';

export { CoreKernel, CoreModule, initHandler };
export type { CoreKernelProps };
