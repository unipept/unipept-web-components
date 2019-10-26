import process from "./process";

const ctx: Worker = self as any;

ctx.addEventListener("message", handleEvent);

async function handleEvent(event){
    try
   {
      let result = await process(event.data.peptides, event.data.config, setProgress)
      ctx.postMessage({type: "result", value: result});
   }
   catch(err)
   {
      ctx.postMessage({type: "error", value: {name: err.name, message: err.message}});
   }
}

/**
 * Send out a message to the calling process that that the progress
 * has changed
 * @param {number} value progress in [0,1]
 */
function setProgress(value) {
    // @ts-ignore
    self.postMessage({ type: "progress", value: value });
}
