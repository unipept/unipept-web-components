import ProgressListener from "./../../progress/ProgressListener";
import { Peptide } from "./../../ontology/raw/Peptide";
export default class PrideCommunicator {
    static readonly PRIDE_BATCH_SIZE: number;
    static readonly PRIDE_COUNT_ENDPOINT: string;
    static readonly PRIDE_LIST_ENDPOINT: string;
    static getPeptidesByPrideId(id: number, progressListener?: ProgressListener): Promise<Peptide[]>;
}
