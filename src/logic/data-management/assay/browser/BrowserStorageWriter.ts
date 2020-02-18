import AssayVisitor from "src/logic/data-management/assay/AssayVisitor";
import MetaGenomicsAssay from "src/logic/data-management/assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "src/logic/data-management/assay/MetaProteomicsAssay";

import { StorageType } from "src/logic/data-management/StorageType";
import { BrowserStorageCommon } from "src/logic/data-management/assay/browser/BrowserStorageCommon";
import PeptideContainer from "src/logic/data-management/PeptideContainer";
import { BrowserStorageConsts } from "src/logic/data-management/assay/browser/BrowserStorageConsts";

export default class BrowserStorageWriter implements AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> {
        throw new Error("Method not implemented.");
    }

    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> {
        let storageType = mpAssay.getStorageType();

        let storage: Storage = BrowserStorageCommon.getStorage(storageType);
        let peptideContainer: PeptideContainer = mpAssay.peptideContainer;

        if (!mpAssay.getId()) {
            mpAssay.setId(BrowserStorageCommon.generateUniqueId())
        }

        let metadata = JSON.stringify({
            id: mpAssay.getId(),
            name: mpAssay.getName(),
            amount: peptideContainer.getAmountOfPeptides(),
            date: mpAssay.getDateFormatted(),
            type: storageType
        });

        storage.setItem(BrowserStorageConsts.MPA_METADATA_PREFIX + mpAssay.getId(), metadata);
        storage.setItem(BrowserStorageConsts.MPA_PEPTIDE_PREFIX + mpAssay.getId(), JSON.stringify({ peptides: peptideContainer.getPeptides() }));


        return;
    }
}
