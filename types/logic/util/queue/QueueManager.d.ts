import WorkerQueue from "./WorkerQueue";
export default class QueueManager {
    private static longRunningQueue;
    static initializeQueue(concurrency: number, workerConstructor?: () => any): void;
    /**
     * Queue for operations that are known to require a lot of work and can take quite some time (i.e. > 0.5s).
     */
    static getLongRunningQueue(): WorkerQueue;
}
