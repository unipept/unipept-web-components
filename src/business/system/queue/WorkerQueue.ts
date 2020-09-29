import async, { AsyncQueue } from "async";

export default class WorkerQueue {
    private queue: AsyncQueue<any>;

    /**
     * @param concurrency How many tasks are allowed to be processed in parallel?
     */
    public constructor(
        private readonly concurrency: number = 4
    ) {
        this.queue = async.queue(async(
            task: () => Promise<any>,
            callback: (x: any) => void,
        ) => {
            console.log("Task started...");
            const start = new Date().getTime();
            const result = await task();
            const end = new Date().getTime();
            console.log("Task took: " + (end - start) / 1000 + "s");
            callback(result);
        }, this.concurrency);
    }

    public async pushTask<ResultType>(task: () => Promise<ResultType>): Promise<ResultType> {
        return new Promise<ResultType>(async(resolve) => {
            await this.queue.push(task, (data: ResultType) => resolve(data));
        });
    }
}
