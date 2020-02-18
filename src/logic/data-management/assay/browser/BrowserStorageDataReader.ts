import AssayVisitor from "src/logic/data-management/assay/AssayVisitor";
import MetaGenomicsAssay from "src/logic/data-management/assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "src/logic/data-management/assay/MetaProteomicsAssay";

import { BrowserStorageCommon } from "src/logic/data-management/assay/browser/BrowserStorageCommon";
import { BrowserStorageConsts } from "src/logic/data-management/assay/browser/BrowserStorageConsts";

export default class BrowserStorageDataReader implements AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> {
        throw new Error("Method not implemented.");
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> {
        const storageType = mpAssay.getStorageType();

        const storage: Storage = BrowserStorageCommon.getStorage(storageType);

        const peptidesSerialized = storage.getItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId());

        if (peptidesSerialized == null) {
            throw "Peptides for dataset " + mpAssay.getId() + " are not available in browser's storage!";
        }

        const parsedPeptides = JSON.parse(peptidesSerialized);
        mpAssay.peptideContainer.setPeptides(parsedPeptides.peptides);

        return;
    }
}
