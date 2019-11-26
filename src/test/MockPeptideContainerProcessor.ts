import process from "../logic/processors/peptide/container/process";
import MPAConfig from "../logic/data-management/MPAConfig";

/**
 * This is a mock implementation of the worker interface that performs all computations on the main thread. This class
 * is only to be used for unit testing purposes.
 */
export default class Worker {
    public async postMessage(event: { peptides: string[], config: MPAConfig }) {
        let result = await process( event.peptides, event.config, "http://localhost:3000", (val) => this.setProgress(val) );
        this.onmessage({
            data: {
                type: "result",
                value: result
            }
        });
    }

    public setProgress(value) {
        this.onmessage({
            data: {
                type: "progress",
                value: value
            }
        })
    }

    public onmessage(event): void {
        // Must be implemented by worker consumer by overriding this function
    }
}
