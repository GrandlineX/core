// eslint-disable-next-line import/prefer-default-export
export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
