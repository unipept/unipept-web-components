export default class WorkerQueue {
    private readonly concurrency;
    private queue;
    private workers;
    /**
     * @param concurrency How many tasks are allowed to be processed in parallel?
     * @param workerConstructor Function that can be used to construct a new worker of a specific type.
     */
    constructor(concurrency: number, workerConstructor: () => Worker);
    pushTask<ResultType, ArgType>(type: string, args: ArgType): Promise<ResultType>;
}
