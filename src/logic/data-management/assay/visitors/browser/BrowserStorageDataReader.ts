import AssayVisitor from "../AssayVisitor";
import MetaGenomicsAssay from "../../MetaGenomicsAssay";
import MetaProteomicsAssay from "../../MetaProteomicsAssay";

import { BrowserStorageCommon } from "./BrowserStorageCommon";
import { BrowserStorageConsts } from "./BrowserStorageConsts";

export default class BrowserStorageDataReader implements AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> {
        throw new Error("Method not implemented.");
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> {
        const storageType = mpAssay.getStorageType();

        const storage: Storage = BrowserStorageCommon.getStorage(storageType);

        const peptidesSerialized = storage.getItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId());
        const serializedMetadata = storage.getItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId());
        
        const parsedMeta = JSON.parse(serializedMetadata);

        mpAssay.setName(parsedMeta.name);
        const splitDate = parsedMeta.date.split("/");
        mpAssay.setDate(new Date(splitDate[0], splitDate[1] - 1, splitDate[2]));
        mpAssay.peptideContainer.setAmountOfPeptides(parsedMeta.amount);

        if (peptidesSerialized == null) {
            throw "Peptides for dataset " + mpAssay.getId() + " are not available in browser's storage!";
        }

        const parsedPeptides = JSON.parse(peptidesSerialized);
        mpAssay.peptideContainer.setPeptides(parsedPeptides.peptides);

        return;
    }
}
