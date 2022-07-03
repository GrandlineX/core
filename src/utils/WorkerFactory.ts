export type WDat<T> = { dat: T; i: number };

export default class WorkerFactory {
  private static async workerFc<T, F>(
    producer: () => Promise<WDat<T> | null>,
    consumer: (arg: WDat<T>) => Promise<WDat<F>>,
    oMap: Map<number, F>
  ): Promise<void> {
    let next = await producer();
    while (next) {
      const res = await consumer(next);
      oMap.set(res.i, res.dat);
      next = await producer();
    }
  }

  static async build<T, F>(
    count: number,
    producer: () => Promise<WDat<T> | null>,
    consumer: (arg: WDat<T>) => Promise<WDat<F>>
  ) {
    const oMap = new Map<number, F>();
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(this.workerFc(producer, consumer, oMap));
    }
    await Promise.all(promises);

    return Array.from(oMap.values());
  }

  static async buildFromArray<X, F>(
    count: number,
    arr: Array<X>,
    mapper: (arg: WDat<X>) => Promise<WDat<F>>
  ) {
    let i = 0;
    return this.build(
      count,
      async () => {
        const cur = i++;
        const curEl = arr[cur];
        if (curEl) {
          return {
            i: cur,
            dat: curEl,
          };
        }
        return null;
      },
      mapper
    );
  }
}
