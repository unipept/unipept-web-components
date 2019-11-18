import process from "./process.js";

self.addEventListener("message", handleEvent);

async function handleEvent(event){
    console.log("Handling event!");
    console.log(event);
    let result = await process(event.data.peptides, event.data.config, event.data.baseUrl, setProgress)
    self.postMessage({ type: "result", value: result });
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