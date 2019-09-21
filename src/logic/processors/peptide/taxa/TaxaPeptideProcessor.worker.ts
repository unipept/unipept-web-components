import PeptideContainer from '../../../data-management/PeptideContainer';
import process from './process';
import MPAConfig from '../../../data-management/MPAConfig';

const ctx: Worker = self as any;

ctx.addEventListener("message", handleEvent);

async function handleEvent(event){
   ctx.postMessage(await process(event.data.peptides, event.data.config));
}
