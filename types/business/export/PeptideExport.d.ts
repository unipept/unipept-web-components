import { CountTable } from "./../counts/CountTable";
import { Peptide } from "./../ontology/raw/Peptide";
import SearchConfiguration from "./../configuration/SearchConfiguration";
import CommunicationSource from "./../communication/source/CommunicationSource";
export default class PeptideExport {
    /**
     * Produces a CSV that contains one row per peptide (these rows are duplicated for peptides that occur multiple
     * times). Every row contains the LCA for a peptide, as well as it's associated lineage, and the top 3 most
     * occurring annotations for the EC-numbers, the three different GO-domains and InterPro-annotations.
     *
     * @param peptideCountTable Count table that contains all peptides and their associated counts that should be
     * present in the generated export.
     * @param searchConfiguration The particular configuration settings that are used for processing the peptides
     * present in the count table.
     * @param communicationSource
     * @param separator The delimiter used to separate columns in the CSV. Use comma for international format, and semi-
     * colon for the European version.
     * @param secondarySeparator The delimiter used to separate multiple functional annotations from each other. Some
     * columns (like the EC-number list) contain multiple items, which need to be separated from each other using a
     * character different from the default separator.
     * @param lineEnding The line terminator that should be used.
     */
    static exportSummaryAsCsv(peptideCountTable: CountTable<Peptide>, searchConfiguration: SearchConfiguration, communicationSource: CommunicationSource, separator?: string, secondarySeparator?: string, lineEnding?: string): Promise<string>;
    private static sortAnnotations;
    /**
     * @return The default set of columns that's part of the generated export.
     */
    private static getHeader;
    /**
     * @param peptideCountTable The count table with all peptides for whom associated peptide counts must be looked up.
     * @param searchConfiguration Search settings needed to process the peptide count table.
     * @return An ontology that contains information about all NCBI-taxa that are associated with the given peptide
     * count table.
     */
    private static computeNcbiOntology;
    private static computeFunctionalOntology;
}
