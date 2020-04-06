import process from "./process.js";
import NetworkCommunicationException from "./../../exceptions/NetworkCommunicationException";

const PEPTDATA_BATCH_SIZE = 100;
const PEPTDATA_ENDPOINT = "/mpa/pept2data";

self.addEventListener("message", handleEvent);

async function handleEvent(event){
    try {
        let result = await process(event.data.peptides, event.data.config, event.data.baseUrl, setProgress)
        // Value is a mapping between a peptide sequence and the response it received from the Unipept API.
        self.postMessage({ type: "result", value: result });
    } catch (err) {
        self.postMessage({ type: "error", value: new NetworkCommunicationException(err.toString()) });
    }
}

/**
 * Send out a message to the calling process that that the progress has changed.
 * @param {number} value progress in [0,1]
 */
function setProgress(value) {
    // @ts-ignore
    self.postMessage({ type: "progress", value: value });
}
