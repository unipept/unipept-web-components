import { BrowserStorageConsts } from "./BrowserStorageConsts";
import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
import BrowserAssayVisitor from "./BrowserAssayVisitor";

export default class BrowserStorageDataReader extends BrowserAssayVisitor {
    visitProteomicsAssay(mpAssay: ProteomicsAssay): Promise<void> {
        const peptidesSerialized = this.browserStorage.getItem(
            BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId()
        );

        if (peptidesSerialized == null) {
            throw "Peptides for dataset " + mpAssay.getId() + " are not available in browser's storage!";
        }

        const parsedPeptides = JSON.parse(peptidesSerialized);
        mpAssay.setPeptides(parsedPeptides.peptides);

        console.log(mpAssay);

        return;
    }
}
