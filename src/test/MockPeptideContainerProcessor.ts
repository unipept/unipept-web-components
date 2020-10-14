import { workerFunctionMap } from "@/business/system/queue/GeneralWorkerExports";


/**
 * This is a mock implementation of the worker interface that performs all computations on the main thread. This class
 * is only to be used for unit testing purposes.
 *
 * @author Pieter Verschaffelt
 */
export default class Worker {
    public async postMessage(task: any) {
        const messageType: string = task.data.type;
        const args: any = task.data.args;

        const result = await workerFunctionMap.get(messageType)(args);
        this.onmessage({
            type: "result",
            result: result
        });
    }

    public onmessage(event): void {
        // Must be implemented by worker consumer by overriding this function
    }
}
