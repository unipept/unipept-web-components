export default class WorkerQueue {
    private readonly concurrency;
    private queue;
    /**
     * @param concurrency How many tasks are allowed to be processed in parallel?
     */
    constructor(concurrency?: number);
    pushTask<ResultType>(task: () => Promise<ResultType>): Promise<ResultType>;
}
