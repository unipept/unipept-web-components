import WorkerQueue from "./WorkerQueue";
export default class QueueManager {
    private static longRunningQueue;
    private static shortRunningQueue;
    static initializeQueue(concurrency: number): void;
    /**
     * Queue for operations that are known to require a lot of work and can take quite some time (i.e. > 0.5s).
     */
    static getLongRunningQueue(): WorkerQueue;
    /**
     * Queue for operations that are known to be very short living (i.e. < 0.5s).
     */
    static getShortRunningQueue(): WorkerQueue;
}
