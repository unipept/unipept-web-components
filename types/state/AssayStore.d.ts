import ProteomicsAssay from "./../business/entities/assay/ProteomicsAssay";
import { Peptide } from "./../business/ontology/raw/Peptide";
import { CountTable } from "./../business/counts/CountTable";
import { ActionContext } from "vuex";
import CommunicationSource from "./../business/communication/source/CommunicationSource";
import NcbiTaxon from "./../business/ontology/taxonomic/ncbi/NcbiTaxon";
import AssayProcessor from "./../business/processors/AssayProcessor";
import ProgressListener from "./../business/progress/ProgressListener";
export declare type AnalysisStatus = "healthy" | "cancelled" | "error";
/**
 * Metadata about the analysis process of an assay.
 */
export declare type AnalysisMeta = {
    progress: number;
    status: AnalysisStatus;
    error: string;
    startProcessingTime: number;
    eta: number;
};
export declare type AssayData = {
    assay: ProteomicsAssay;
    analysisMetaData: AnalysisMeta;
    peptideCountTable: CountTable<Peptide>;
    filteredPeptideCountTable: CountTable<Peptide>;
    communicationSource: CommunicationSource;
    assayProcessor: AssayProcessor;
    filterPercentage: number;
    taxonFilter: NcbiTaxon;
};
export interface AssayState {
    assayData: AssayData[];
    activeAssay: ProteomicsAssay;
}
export declare const createAssayStore: (assayProcessorFactory: (store: ActionContext<AssayState, any>, assay: ProteomicsAssay, progressListener: ProgressListener) => AssayProcessor) => any;
