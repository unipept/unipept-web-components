import AssayVisitor from "../AssayVisitor";
import MetaGenomicsAssay from "../../MetaGenomicsAssay";
import MetaProteomicsAssay from "../../MetaProteomicsAssay";

import { BrowserStorageDataReader } from "./browser/BrowserStorageDataReader";

import { StorageType } from "../../../StorageType";

export default class StorageDataReader implements AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> {
        let storageType = mgAssay.getStorageType();

        switch (storageType) {
        case StorageType.LocalStorage:
        case StorageType.SessionStorage:
            return BrowserStorageDataReader.readMetaGenomicsAssay(mgAssay, storageType);
        }
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> {
        let storageType = mpAssay.getStorageType();

        switch (storageType) {
        case StorageType.LocalStorage:
        case StorageType.SessionStorage:
            return BrowserStorageDataReader.readMetaProteomicsAssay(mpAssay, storageType);
        }
    }
}
