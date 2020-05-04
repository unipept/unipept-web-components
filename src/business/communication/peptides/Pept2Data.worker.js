import process from "./process";
import { expose } from "threads/worker";
import { Observable } from "observable-fns"

const PEPTDATA_BATCH_SIZE = 100;
const PEPTDATA_ENDPOINT = "/mpa/pept2data";

expose(process)
//
// self.addEventListener("message", handleEvent);
//
// async function handleEvent(event){
//     try {
//         let result = await process(event.data.peptides, event.data.config, event.data.baseUrl, setProgress)
//         // Value is a mapping between a peptide sequence and the response it received from the Unipept API.
//         self.postMessage({ type: "result", value: result });
//     } catch (err) {
//         self.postMessage({ type: "error", value: err.toString() });
//     }
// }
//
// /**
//  * Send out a message to the calling process that that the progress has changed.
//  * @param {number} value progress in [0,1]
//  */
// function setProgress(value) {
//     // @ts-ignore
//     self.postMessage({ type: "progress", value: value });
// }
