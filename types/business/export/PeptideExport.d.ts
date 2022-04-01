import { CountTable } from "./../counts/CountTable";
import { Peptide } from "./../ontology/raw/Peptide";
import NcbiTaxon, { NcbiId } from "./../ontology/taxonomic/ncbi/NcbiTaxon";
import { Ontology } from "./../ontology/Ontology";
import EcDefinition, { EcCode } from "./../ontology/functional/ec/EcDefinition";
import GoDefinition, { GoCode } from "./../ontology/functional/go/GoDefinition";
import InterproDefinition, { InterproCode } from "./../ontology/functional/interpro/InterproDefinition";
import { PeptideData } from "@/business";
import { ShareableMap } from "shared-memory-datastructures";
export default class PeptideExport {
    /**
     * Produces a CSV that contains one row per peptide (these rows are duplicated for peptides that occur multiple
     * times). Every row contains the LCA for a peptide, as well as it's associated lineage, and the top 3 most
     * occurring annotations for the EC-numbers, the three different GO-domains and InterPro-annotations.
     *
     * @param peptideCountTable Count table that contains all peptides and their associated counts that should be
     * present in the generated export.
     * @param pept2data Mapping between peptide and all of its associated functional annotations (as well as the
     * taxonomic information).
     * @param goOntology
     * @param ecOntology
     * @param iprOntology
     * @param ncbiOntology
     * @param separator The delimiter used to separate columns in the CSV. Use comma for international format, and semi-
     * colon for the European version.
     * @param secondarySeparator The delimiter used to separate multiple functional annotations from each other. Some
     * columns (like the EC-number list) contain multiple items, which need to be separated from each other using a
     * character different from the default separator.
     * @param lineEnding The line terminator that should be used.
     */
    static exportSummaryAsCsv(peptideCountTable: CountTable<Peptide>, pept2data: ShareableMap<Peptide, PeptideData>, goOntology: Ontology<GoCode, GoDefinition>, ecOntology: Ontology<EcCode, EcDefinition>, iprOntology: Ontology<InterproCode, InterproDefinition>, ncbiOntology: Ontology<NcbiId, NcbiTaxon>, separator?: string, secondarySeparator?: string, lineEnding?: string): Promise<string>;
    private static sortAnnotations;
    /**
     * @return The default set of columns that's part of the generated export.
     */
    private static getHeader;
}
