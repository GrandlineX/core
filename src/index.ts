/**
 * @name CoreKernel Main Module
 * @author David Nagy
 */
import CoreKernel, { CoreKernelProps } from './CoreKernel.js';
import CoreModule from './CoreModule.js';

import initHandler from './utils/initHandler.js';

export * from './dev/index.js';
export * from './classes/index.js';
export * from './database/index.js';
export * from './lib/index.js';
export * from './modules/index.js';
export * from './services/index.js';
export * from './utils/index.js';

export { CoreKernel, CoreModule, initHandler, CoreKernelProps };
export default CoreKernel;
