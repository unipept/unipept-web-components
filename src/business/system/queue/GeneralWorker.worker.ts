import { compute as computeHighlightedTree } from "@/business/processors/taxonomic/ncbi/HighlightTree.workerSource"
import { computeNcbiOntology } from "@/business/ontology/taxonomic/ncbi/NcbiOntologyProcessor.workerSource";
import { compute as computePeptideCountTable } from "@/business/processors/raw/PeptideCountProcessor.workerSource";
import {
    compute as computeLcaCountTable
} from "@/business/processors/taxonomic/ncbi/LcaCountTableProcessor.workerSource";
import {
    compute as computeFunctionalCountTable
} from "@/business/processors/functional/FunctionalCountTableProcessor.workerSource";

const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.addEventListener("message", async(event: MessageEvent) => {
    const messageType: string = event.data.type;
    let args: any = event.data.args;

    let result: any;

    if (messageType === "highlightedTree") {
        result = await computeHighlightedTree(args);
    } else if (messageType === "computeNcbiOntology") {
        result = await computeNcbiOntology(args);
    } else if (messageType === "computeFunctionalCountTable") {
        result = await computeFunctionalCountTable(args);
    } else if (messageType === "computePeptideCountTable") {
        result = await computePeptideCountTable(args);
    } else if (messageType === "computeLcaCountTable") {
        result = await computeLcaCountTable(args);
    } else {
        console.error("[WorkerQueue] Unknown message type: " + messageType);
        return;
    }

    ctx.postMessage({
        type: "result",
        result: result
    });

    try {
        // This is unfortunately required to get the workers to stop consuming 100% CPU once they're done processing...
        if (global && global.gc) {
            global.gc();
        }
    } catch (err) {
        // GC is not available.
    }
});
