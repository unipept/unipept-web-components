import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
import Assay from "./../../../entities/assay/Assay";
import BrowserStorageMetadataReader from "./BrowserStorageMetadataReader";
import { BrowserStorageConsts } from "./BrowserStorageConsts";

export default class BrowserAssayManager {
    /**
     * Parses the metadata of all assays that are present in local storage. This means that the peptide-field of the
     * returned assays is not filled in, and needs to be parsed later on.
     *
     * Only assays that are stored in local storage are considered here. The assays that are instead stored in session
     * storage are not processed by this function.
     */
    public async listAssays(): Promise<ProteomicsAssay[]> {
        const output: ProteomicsAssay[] = [];
        const storage = window.localStorage;
        const assayMetaDataReader = new BrowserStorageMetadataReader(storage);

        for (let i = 0; i < storage.length; i++) {
            let key = storage.key(i);
            if (key && key.startsWith(BrowserStorageConsts.MPA_METADATA_PREFIX)) {
                const assay = new ProteomicsAssay(
                    key.substr(BrowserStorageConsts.MPA_METADATA_PREFIX.length)
                );
                await assay.accept(assayMetaDataReader);
                output.push(assay);
            }
        }

        return output;
    }
}
