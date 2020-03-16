import { ProcessedPeptideContainer } from "../../data-management/ProcessedPeptideContainer";
import { GOCountTable } from "../../data-management/counts/GOCountTable";
import { FAPeptideProcessor } from "./FAPeptideProcessor";
import { Ontologies } from "../../data-management/ontology/Ontologies";

export namespace GOPeptideProcessor
{
    export async function process(processedPeptides: ProcessedPeptideContainer, baseURL: string): Promise<GOCountTable> {
        return FAPeptideProcessor.process(processedPeptides, "GO:", Ontologies.geneOntology, baseURL, (a, b, c) => new GOCountTable(a, b, c));
    }
}
