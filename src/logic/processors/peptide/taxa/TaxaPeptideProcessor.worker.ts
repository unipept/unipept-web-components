import PeptideContainer from '../../../data-management/PeptideContainer';
import process from './process';

const ctx: Worker = self as any;

ctx.addEventListener("message", (event) => 
{
   var peptides: PeptideContainer = event.data;
   ctx.postMessage(process(peptides));
});
