import { CountTable, EcCode, EcDefinition, GoCode, GoDefinition, InterproCode, InterproDefinition, NcbiId, NcbiTaxon, Ontology, Peptide, PeptideData } from "@/logic";
import { ShareableMap } from "shared-memory-datastructures";
export default function usePeptideExport(): {
    exportAsCsv: (peptideCountTable: CountTable<Peptide>, pept2data: ShareableMap<Peptide, PeptideData>, goOntology: Ontology<GoCode, GoDefinition>, ecOntology: Ontology<EcCode, EcDefinition>, iprOntology: Ontology<InterproCode, InterproDefinition>, ncbiOntology: Ontology<NcbiId, NcbiTaxon>, separator?: string, secondarySeparator?: string, lineEnding?: string) => string;
};
