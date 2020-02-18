import AssayVisitor from "src/logic/data-management/assay/AssayVisitor";
import MetaGenomicsAssay from "src/logic/data-management/assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "src/logic/data-management/assay/MetaProteomicsAssay";

import { StorageType } from "src/logic/data-management/StorageType";
import { BrowserStorageCommon } from "src/logic/data-management/assay/browser/BrowserStorageCommon";
import { BrowserStorageConsts } from "src/logic/data-management/assay/browser/BrowserStorageConsts";

export default class BrowserStorageRemover implements AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> {
        throw new Error("Method not implemented.");
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> {
        const storage: Storage = BrowserStorageCommon.getStorage(mpAssay.getStorageType());
        storage.removeItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId());
        storage.removeItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId());

        return;
    }
}
