import {IPeptideProcessor} from "../IPeptideProcessor";
import PeptideContainer from '../../../../../logic/data-management/PeptideContainer';
import Worker from 'worker-loader!./Worker';

import "babel-polyfill"; // for async await support

export class TaxaPeptideProcessor implements IPeptideProcessor
{
    process(peptides: PeptideContainer)
    {
        return new Promise<string>(resolve => 
        {
            var worker = new Worker();
            worker.postMessage(peptides);
            worker.onmessage = (event) => resolve(event.data as string);
        });
    }
}