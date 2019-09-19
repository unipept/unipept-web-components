import PeptideContainer from '../../../../../logic/data-management/PeptideContainer';

const ctx: Worker = self as any;

ctx.addEventListener("message", (event) => 
{
   var peptides: PeptideContainer = event.data;
   console.log("I'm a worker!");
   var result: string = "I'm the result";
   ctx.postMessage(result);
});
