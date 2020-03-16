import PeptideContainer from "../../../data-management/PeptideContainer";
import { ProcessedPeptideContainer } from "../../../data-management/ProcessedPeptideContainer";

import Worker from "worker-loader!./PeptideContainerProcessor.worker.js";
import ProgressPublisher from "../../../patterns/progress/ProgressPublisher";
import MPAConfig from "../../../data-management/MPAConfig";

export class PeptideContainerProcessor extends ProgressPublisher {
    private _worker: Worker;

    constructor() {
        super()
        this._worker = new Worker();
    }

    process(peptides: PeptideContainer, mpaConfig: MPAConfig, baseUrl: string) : Promise<ProcessedPeptideContainer> {
        return new Promise<ProcessedPeptideContainer>(resolve => {
            this._worker.onmessage = (event) => {
                switch (event.data.type) {
                case "progress":
                    this.updateProgress(event.data.value);
                    break;
                case "result":
                    // Do this to preserve methods as methods aren't duplicated by the structured cloning algorithm used
                    // to pass worker messages
                    resolve(event.data.value as ProcessedPeptideContainer);
                    break;
                }
            };
            this._worker.postMessage({ peptides: peptides.getPeptides(), config: mpaConfig, baseUrl: baseUrl });
        });
    }
}
