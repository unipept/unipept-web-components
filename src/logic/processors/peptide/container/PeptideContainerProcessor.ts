import PeptideContainer from '../../../data-management/PeptideContainer';
import MPAConfig from '../../../data-management/MPAConfig';
import { ProcessedPeptideContainer } from '../../../data-management/ProcessedPeptideContainer';

import Worker from 'worker-loader!./PeptideContainerProcessor.worker';

import "babel-polyfill"; // for async await support

export class PeptideContainerProcessor
{
    private _worker: Worker;

    constructor()
    {
        this._worker = new Worker();
    }

    process(peptides: PeptideContainer, mpaConfig: MPAConfig) : Promise<ProcessedPeptideContainer>
    {
        return new Promise<ProcessedPeptideContainer>(resolve => 
        {
            this._worker.onmessage = (event) => resolve(event.data as ProcessedPeptideContainer);
            this._worker.postMessage({peptides: peptides.getPeptidesSync(), config: mpaConfig});
        });
    }
}
