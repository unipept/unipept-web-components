import AssayVisitor from "../AssayVisitor";
import MetaGenomicsAssay from "../../MetaGenomicsAssay";
import MetaProteomicsAssay from "../../MetaProteomicsAssay";

import { StorageType } from "../../../StorageType";
import { BrowserStorageCommon } from "./BrowserStorageCommon";
import PeptideContainer from "../../../PeptideContainer";
import { BrowserStorageConsts } from "./BrowserStorageConsts";

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
