import { default as computeFunctionalCountTable } from "../../../logic/processing/functional/FunctionalCountTableProcessor.workerSource";
import { default as computeNcbiOntology } from "../../../logic/processing/taxonomic/NcbiOntologyProcessor.workerSource";
import { default as computeLcaCountTable } from "../../../logic/processing/taxonomic/LcaCountTableProcessor.workerSource";
import { default as computePeptideCountTable } from "../../../logic/processing/peptide/PeptideCountTableProcessor.workerSource";
import { default as computeHighlightedTree } from "../../../logic/processing/taxonomic/HighlightedTreeProcessor.workerSource";

export const workerFunctionMap: Map<string, (any: any) => Promise<any>> = new Map<string, (any: any) => Promise<any>>([
    ["computeNcbiOntology", computeNcbiOntology],
    ["computeFunctionalCountTable", computeFunctionalCountTable],
    ["computeLcaCountTable", computeLcaCountTable],
    ["computePeptideCountTable", computePeptideCountTable],
    ["computeHighlightedTree", computeHighlightedTree]
]);

export function createMessageEventListener(ctx: Worker): (event: MessageEvent) => Promise<void> {
    return async(event: MessageEvent) => {
        const messageType: string = event.data.type;
        const args: any = event.data.args;

        if (!workerFunctionMap.has(messageType)) {
            throw new Error("[WorkerQueue] Unknown message type: " + messageType);
        }

        // @ts-ignore
        const result = await workerFunctionMap.get(messageType)(args);

        ctx.postMessage({
            type: "result",
            result: result
        });

        try {
            // This is unfortunately required to get the workers to stop consuming 100% CPU once they're done
            // processing...
            // @ts-ignore
            if (global && global.gc) {
                // @ts-ignore
                global.gc();
            }
        } catch (err) {
            // GC is not available.
        }
    };
}
