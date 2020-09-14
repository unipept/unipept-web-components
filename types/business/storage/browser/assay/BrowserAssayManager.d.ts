import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
export default class BrowserAssayManager {
    /**
     * Parses the metadata of all assays that are present in local storage. This means that the peptide-field of the
     * returned assays is not filled in, and needs to be parsed later on.
     *
     * Only assays that are stored in local storage are considered here. The assays that are instead stored in session
     * storage are not processed by this function.
     */
    listAssays(): Promise<ProteomicsAssay[]>;
}
