import { ProcessedPeptideContainer } from "../../data-management/ProcessedPeptideContainer";
import { ECCountTable } from "../../data-management/counts/ECCountTable";
import { FAPeptideProcessor } from "./FAPeptideProcessor";
import { Ontologies } from "../../data-management/ontology/Ontologies";

export namespace ECPeptideProcessor
{
    export async function process(processedPeptides: ProcessedPeptideContainer, baseURL: string): Promise<ECCountTable> {
        return FAPeptideProcessor.process(processedPeptides, "EC:", Ontologies.ecOntology, baseURL, (a, b, c) => new ECCountTable(a, b, c));
    }
}
