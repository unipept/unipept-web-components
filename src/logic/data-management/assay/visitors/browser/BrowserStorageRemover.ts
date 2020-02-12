import AssayVisitor from "../AssayVisitor";
import MetaGenomicsAssay from "../../MetaGenomicsAssay";
import MetaProteomicsAssay from "../../MetaProteomicsAssay";

import { StorageType } from "../../../StorageType";
import { BrowserStorageCommon } from "./BrowserStorageCommon";
import { BrowserStorageConsts } from "./BrowserStorageConsts";

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
