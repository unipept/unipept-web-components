import {PeptideProcessor} from "../PeptideProcessor";
import Worker from 'worker-loader!./TaxaPeptideProcessor.worker';

import "babel-polyfill"; // for async await support

export class TaxaPeptideProcessor extends PeptideProcessor
{
    constructor()
    {
        super(new Worker())
    }
}