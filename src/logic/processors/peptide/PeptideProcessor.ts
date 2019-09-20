import PeptideContainer from "../../data-management/PeptideContainer";

export abstract class PeptideProcessor{

    private _worker: Worker;

    constructor(worker: Worker){
        this._worker = worker;
    }

    process(peptides: PeptideContainer)
    {
        return new Promise<string>(resolve => 
        {
            this._worker.onmessage = (event) => resolve(event.data as string);
            this._worker.postMessage(peptides);
        });
    }
}