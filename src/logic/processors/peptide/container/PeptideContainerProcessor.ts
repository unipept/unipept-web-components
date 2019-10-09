import PeptideContainer from '../../../data-management/PeptideContainer';
import { ProcessedPeptideContainer } from '../../../data-management/ProcessedPeptideContainer';

import Worker from 'worker-loader!./PeptideContainerProcessor.worker';
import ProgressPublisher from '../../../patterns/progress/ProgressPublisher';
import MPAConfig from '../../../data-management/MPAConfig';

// import "babel-polyfill"; // for async await support

export class PeptideContainerProcessor extends ProgressPublisher
{
    private _worker: Worker;

    constructor()
    {
        super()
        this._worker = new Worker();
    }

    process(peptides: PeptideContainer, mpaConfig: MPAConfig) : Promise<ProcessedPeptideContainer>
    {
        return new Promise<ProcessedPeptideContainer>(resolve => 
        {
            this._worker.onmessage = (event) => 
            {
                switch(event.data.type)
                {
                    case "progress":
                        this.updateProgress(event.data.value);
                        break;
                    case "result":
                        resolve(event.data.value as ProcessedPeptideContainer);
                        break;
                }
            };
            this._worker.postMessage({peptides: peptides.getPeptides(), config: mpaConfig});
        });
    }
}
