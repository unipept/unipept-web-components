import { compute as computeHighlightedTree } from "@/business/processors/taxonomic/ncbi/HighlightTree.workerSource"
import { computeNcbiOntology } from "@/business/ontology/taxonomic/ncbi/NcbiOntologyProcessor.workerSource";
import { compute as computePeptideCountTable } from "@/business/processors/raw/PeptideCountProcessor.workerSource";
import {
    compute as computeLcaCountTable
} from "@/business/processors/taxonomic/ncbi/LcaCountTableProcessor.workerSource";
import {
    compute as computeFunctionalCountTable
} from "@/business/processors/functional/FunctionalCountTableProcessor.workerSource";

export const workerFunctionMap: Map<string, (any) => Promise<any>> = new Map<string, (any) => Promise<any>>([
    ["highlightedTree", computeHighlightedTree],
    ["computeNcbiOntology", computeNcbiOntology],
    ["computeFunctionalCountTable", computeFunctionalCountTable],
    ["computePeptideCountTable", computePeptideCountTable],
    ["computeLcaCountTable", computeLcaCountTable]
]);

export function createMessageEventListener(ctx: Worker): (event: MessageEvent) => Promise<void> {
    return async(event: MessageEvent) => {
        const messageType: string = event.data.type;
        const args: any = event.data.args;

        if (workerFunctionMap.has(messageType)) {
            const result = await workerFunctionMap.get(messageType)(args);
            ctx.postMessage({
                type: "result",
                result: result
            });
        } else {
            console.error("[WorkerQueue] Unknown message type: " + messageType);
            return;
        }

        try {
            // This is unfortunately required to get the workers to stop consuming 100% CPU once they're done
            // processing...
            if (global && global.gc) {
                global.gc();
            }
        } catch (err) {
            // GC is not available.
        }
    };
}
