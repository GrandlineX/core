import os from 'os';
import { ICoreKernel } from '../lib';

export async function envCall(kernel: ICoreKernel<any>) {
  return {
    os: {
      platform: os.platform(),
      arch: os.arch(),
      homedir: os.homedir(),
      release: os.release(),
      user: os.userInfo(),
      tmpdir: os.tmpdir(),
      type: os.type(),
    },
    folder: kernel.getGlobalConfig().dir,
  };
}

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
