import { ICoreKernelModule, ILogChannel, WorkLoad } from '../lib';
import CoreBridge from '../classes/CoreBridge';

export default async function initHandler(
  modList: ICoreKernelModule<any, any, any, any, any>[],
  logger: ILogChannel
): Promise<void> {
  modList.forEach((src) => {
    src.getDependencyList().forEach((dep) => {
      const tar = modList.find((mod) => mod.getName() === dep);
      if (tar) {
        const bridge = new CoreBridge(src, tar);
        bridge.connect();
      } else {
        logger.error(`DEPENDING MOD NOT FOUND: ${dep}`);
        process.exit(4);
      }
    });
  });

  const workload: WorkLoad<any> = [];
  modList.forEach((action) => {
    workload.push(action.register());
  });

  await Promise.all(workload);
  const workloadStart: WorkLoad<any> = [];
  modList.forEach((action) => {
    if (action?.start) {
      workloadStart.push(action.start());
    }
  });
  await Promise.all(workloadStart);
}
