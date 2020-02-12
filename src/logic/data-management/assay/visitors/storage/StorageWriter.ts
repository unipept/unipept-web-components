import AssayVisitor from "../AssayVisitor";
import MetaGenomicsAssay from "../../MetaGenomicsAssay";
import MetaProteomicsAssay from "../../MetaProteomicsAssay";

import { BrowserStorageWriter } from "./browser/BrowserStorageWriter";

import { StorageType } from "../../../StorageType";

export default class StorageWriter implements AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> {
        let storageType = mgAssay.getStorageType();

        switch (storageType) {
        case StorageType.LocalStorage:
        case StorageType.SessionStorage:
            return BrowserStorageWriter.writeMetaGenomicsAssay(mgAssay, storageType);
        }
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> {
        let storageType = mpAssay.getStorageType();

        switch (storageType) {
        case StorageType.LocalStorage:
        case StorageType.SessionStorage:
            return BrowserStorageWriter.writeMetaProteomicsAssay(mpAssay, storageType);
        }
    }
}
