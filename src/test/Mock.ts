import MetaProteomicsAssay from "@/logic/data-management/assay/MetaProteomicsAssay";
import { StorageType } from "@/logic/data-management/StorageType";
import Assay from "@/logic/data-management/assay/Assay";
import { PeptideContainer } from "@/logic";
import DataRepository from "@/logic/data-source/DataRepository";

export default class Mock {
    public mockAssay(): Assay {
        let sequences: string[] = [
            "SGIVLPGQAQEKPQQAEVVAVGPGGVVDGK",
            "SGIVLPGQAQEKPQQAEVVAVGPGGVVDGKEVK",
            "MEVAVGDKVIYSK",
            "MDGTEYIIVK",
            "GLTAAIEAADAMTK",
            "AAEVALVGTEK",
            "IGSGLVTVMVR",
            "IGSGLVTVMVR",
            "AAVESGSAAASR"
        ]

        let output: MetaProteomicsAssay = new MetaProteomicsAssay(
            "1", 
            StorageType.LocalStorage, 
            "Sample X", 
            new Date("2019-10-21")
        );

        let peptideContainer: PeptideContainer = new PeptideContainer(sequences);
        output.peptideContainer = peptideContainer;
        
        return output;
    }

    public mockDataRepository(): DataRepository {
        let assay: Assay = this.mockAssay();
        return assay.dataRepository;
    }
}