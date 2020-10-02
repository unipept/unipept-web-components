import async, { AsyncQueue } from "async";
import Worker from "worker-loader?inline=fallback!./GeneralWorker.worker";

export default class WorkerQueue {
    private queue: AsyncQueue<any>;
    private workers: Worker[] = [];

    /**
     * @param concurrency How many tasks are allowed to be processed in parallel?
     */
    public constructor(
        private readonly concurrency: number = 4
    ) {
        // Create the specified amount of workers
        for (let i = 0; i < this.concurrency; i++) {
            this.workers.push(new Worker());
        }

        this.queue = async.queue(async(
            task: { type: string, args: any },
            callback: (x: any) => void,
        ) => {
            // Retrieve worker from the pool.
            const worker: Worker = this.workers.pop();

            const result = await new Promise<any>((resolve) => {
                const listener = (event: MessageEvent) => {
                    worker.removeEventListener("message", listener);
                    resolve(event.data.result);
                };

                worker.addEventListener("message", listener);
                worker.postMessage(task);
            });

            // Add worker back to the pool.
            this.workers.push(worker);
            callback(result);
        }, this.concurrency);
    }

    public async pushTask<ResultType, ArgType>(type: string, args: ArgType): Promise<ResultType> {
        return new Promise<ResultType>(async(resolve) => {
            await this.queue.push({ type, args }, (data: ResultType) => resolve(data));
        });
    }
}
