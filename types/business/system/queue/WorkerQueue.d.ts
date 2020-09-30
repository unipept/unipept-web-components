export default class WorkerQueue {
    private readonly concurrency;
    private queue;
    private workers;
    /**
     * @param concurrency How many tasks are allowed to be processed in parallel?
     */
    constructor(concurrency?: number);
    pushTask<ResultType, ArgType>(type: string, args: ArgType): Promise<ResultType>;
}
