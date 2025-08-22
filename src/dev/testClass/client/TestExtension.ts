import CoreKernelExtension from '../../../classes/CoreKernelExtension.js';

export default class TestExtension extends CoreKernelExtension {
  async start(): Promise<void> {
    this.info('Starting');
  }

  async stop(): Promise<void> {
    this.info('Stop');
  }
}
