import { BrowserStorageConsts } from "./BrowserStorageConsts";
import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
import BrowserAssayVisitor from "./BrowserAssayVisitor";

export default class BrowserStorageWriter extends BrowserAssayVisitor {
    async visitProteomicsAssay(mpAssay: ProteomicsAssay): Promise<void> {
        let metadata = JSON.stringify({
            id: mpAssay.getId(),
            name: mpAssay.getName(),
            amount: mpAssay.getAmountOfPeptides(),
            date: this.toDateString(mpAssay.getDate())
        });

        this.browserStorage.setItem(
            BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId(),
            metadata
        );

        this.browserStorage.setItem(
            BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId(),
            JSON.stringify({
                peptides: mpAssay.getPeptides()
            })
        );
    }

    private toDateString(date: Date): string {
        return date.getUTCDate() + "/" + date.getUTCMonth() + "/" + date.getUTCFullYear();
    }
}
