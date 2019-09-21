import PeptideContainer from "../../data-management/PeptideContainer";
import {CountTable} from "../../data-management/counts/CountTable";
import MPAConfig from '../../data-management/MPAConfig';

export abstract class PeptideProcessor{

    private _worker: Worker;

    constructor(worker: Worker){
        this._worker = worker;
    }

    process(peptides: PeptideContainer, mpaConfig: MPAConfig)
    {
        return new Promise<CountTable>(resolve => 
        {
            this._worker.onmessage = (event) => resolve(event.data as CountTable);
            this._worker.postMessage({peptides: peptides, config: mpaConfig});
        });
    }
}