import { BrowserStorageConsts } from "./BrowserStorageConsts";
import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
import BrowserAssayVisitor from "./BrowserAssayVisitor";

export default class BrowserStorageRemover extends BrowserAssayVisitor {
    async visitProteomicsAssay(mpAssay: ProteomicsAssay): Promise<void> {
        this.browserStorage.removeItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId());
        this.browserStorage.removeItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId());
    }
}
