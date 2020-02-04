import { ProcessedPeptideContainer } from "../../data-management/ProcessedPeptideContainer";
import { InterproCountTable } from "../../data-management/counts/InterproCountTable";
import { FAPeptideProcessor } from "./FAPeptideProcessor";
import { Ontologies } from "../../data-management/ontology/Ontologies";
 
export namespace InterproPeptideProcessor
{
    export async function process(processedPeptides: ProcessedPeptideContainer, baseURL: string): Promise<InterproCountTable> {
        return FAPeptideProcessor.process(processedPeptides, "IPR:", Ontologies.ecOntology, baseURL, (a, b, c) => new InterproCountTable(a, b, c));
    }
}
