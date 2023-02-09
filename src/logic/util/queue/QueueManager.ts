import WorkerQueue from "./WorkerQueue";
// @ts-ignore
import Worker from "worker-loader?inline=fallback!./GeneralWorker.worker";

export default class QueueManager {
    private static longRunningQueue: WorkerQueue;

    public static initializeQueue(concurrency: number, workerConstructor: () => any = () => new Worker()) {
        QueueManager.longRunningQueue = new WorkerQueue(concurrency, workerConstructor);
    }

    /**
     * Queue for operations that are known to require a lot of work and can take quite some time (i.e. > 0.5s).
     */
    public static getLongRunningQueue(): WorkerQueue {
        return this.longRunningQueue;
    }
}
