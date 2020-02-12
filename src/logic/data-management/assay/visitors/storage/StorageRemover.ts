import AssayVisitor from "../AssayVisitor";
import MetaGenomicsAssay from "../../MetaGenomicsAssay";
import MetaProteomicsAssay from "../../MetaProteomicsAssay";

import { BrowserStorageRemover } from "./browser/BrowserStorageRemover";

import { StorageType } from "../../../StorageType";

export default class StorageRemover implements AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> {
        let storageType = mgAssay.getStorageType();

        switch (storageType) {
        case StorageType.LocalStorage:
        case StorageType.SessionStorage:
            return BrowserStorageRemover.removeMetaGenomicsAssay(mgAssay, storageType);
        }
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> {
        let storageType = mpAssay.getStorageType();

        switch (storageType) {
        case StorageType.LocalStorage:
        case StorageType.SessionStorage:
            return BrowserStorageRemover.removeMetaProteomicsAssay(mpAssay, storageType);
        }
    }
}
