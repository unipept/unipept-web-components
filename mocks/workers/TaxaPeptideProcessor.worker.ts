import process from "../../src/logic/processors/peptide/taxa/process";

// mock for worker that executes the process function synchronously
export default class WorkerMock {
    onmessage : any;

    constructor() {
        this.onmessage = () => { };
    }

    postMessage(data) {
        this.onmessage({ data: process(data.peptides, data.config) });
    }
}