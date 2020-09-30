import WorkerQueue from "./WorkerQueue";

export default class QueueManager {
    private static longRunningQueue;

    public static initializeQueue(concurrency: number) {
        QueueManager.longRunningQueue = new WorkerQueue(concurrency);
    }

    /**
     * Queue for operations that are known to require a lot of work and can take quite some time (i.e. > 0.5s).
     */
    public static getLongRunningQueue(): WorkerQueue {
        return this.longRunningQueue;
    }
}
