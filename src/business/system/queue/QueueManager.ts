import WorkerQueue from "./WorkerQueue";

export default class QueueManager {
    private static longRunningQueue = new WorkerQueue();
    private static shortRunningQueue = new WorkerQueue();

    /**
     * Queue for operations that are known to require a lot of work and can take quite some time (i.e. > 0.5s).
     */
    public static getLongRunningQueue(): WorkerQueue {
        return this.longRunningQueue;
    }

    /**
     * Queue for operations that are known to be very short living (i.e. < 0.5s).
     */
    public static getShortRunningQueue(): WorkerQueue {
        return this.shortRunningQueue;
    }
}
