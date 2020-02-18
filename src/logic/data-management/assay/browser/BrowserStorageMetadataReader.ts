import AssayVisitor from "src/logic/data-management/assay/AssayVisitor";
import MetaGenomicsAssay from "src/logic/data-management/assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "src/logic/data-management/assay/MetaProteomicsAssay";

import { BrowserStorageCommon } from "src/logic/data-management/assay/browser/BrowserStorageCommon";
import { BrowserStorageConsts } from "src/logic/data-management/assay/browser/BrowserStorageConsts";

export default class BrowserStorageMetadatReader implements AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> {
        throw new Error("Method not implemented.");
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> {
        const storageType = mpAssay.getStorageType();

        const storage: Storage = BrowserStorageCommon.getStorage(storageType);
        const serializedMetadata = storage.getItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId());

        const parsedMeta = JSON.parse(serializedMetadata);

        mpAssay.setName(parsedMeta.name);
        const splitDate = parsedMeta.date.split("/");
        mpAssay.setDate(new Date(splitDate[0], splitDate[1] - 1, splitDate[2]));
        mpAssay.peptideContainer.setAmountOfPeptides(parsedMeta.amount);

        return;
    }
}
