import async, { QueueObject } from "async";

export default class WorkerQueue {
    private queue: QueueObject<any>;
    private workers: Worker[] = [];

    /**
     * @param concurrency How many tasks are allowed to be processed in parallel?
     * @param workerConstructor Function that can be used to construct a new worker of a specific type.
     */
    public constructor(
        private readonly concurrency: number = 4,
        workerConstructor: () => Worker
    ) {
        // Create the specified amount of workers
        for (let i = 0; i < this.concurrency; i++) {
            this.workers.push(workerConstructor());
        }

        this.queue = async.queue(async(
            task: { type: string, args: any }
        ) => {
            // Retrieve worker from the pool.
            const worker = this.workers.pop();

            if(worker) {
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

                return result
            }
        }, this.concurrency);
    }

    public async pushTask<ResultType, ArgType>(type: string, args: ArgType): Promise<ResultType> {
        return this.queue.push({type, args});
    }
}
