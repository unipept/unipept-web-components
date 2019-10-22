import MetaProteomicsAssay from "@/logic/data-management/assay/MetaProteomicsAssay";
import { StorageType } from "@/logic/data-management/StorageType";
import Assay from "@/logic/data-management/assay/Assay";
import DataRepository from "@/logic/data-source/DataRepository";
import { PeptideContainer } from '@/logic/data-management';
import MpaAnalysisManager from '@/logic/data-management/MpaAnalysisManager';
import MPAConfig from '@/logic/data-management/MPAConfig';

export default class Mock {
    public mockAssay(): Assay {
        let sequences: string[] = [
            "YVVIQPGVK",
            "SGIAPFYSDKYAK",
            "FLGFEQIFK",
            "LVLVNAVYFR",
            "FATSDLNDLYR",
            "AAANESFGYNEDEIVSSDIVGMR",
            "LGENNAELNALAK",
            "LAEEVIR",
            "YEVGTMIEIPR",
            "GMFSMMNYYLPLK",
            "TNTILQSAFFK",
            "ANFEGECSEVGMYLAMAR",
            "MEVAVGDKVIYSK",
            "QLIVPLIPSIVDR",
            "ELASLHGTK",
            "LQTNGAVPDVLQQGR",
            "SFAINFK",
            "FATSDLNDLYR",
            "GTVDEFSGAEIVDK",
            "AAGGLAIIGTER",
            "KLLDQGEAGDNVGLLLR",
            "LIDLGVIVGSGYHVNPK",
            "VYFLNFKPESSDEWKK",
            "IGIVAVSR",
            "AVGFGGDFDGVPR"
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

    public mockMPAConfig(): MPAConfig {
        return {
            il: true,
            dupes: true,
            missed: false
        }
    }

    public async mockDataRepository(): Promise<DataRepository> {
        let assay: Assay = this.mockAssay();
        let manager: MpaAnalysisManager = new MpaAnalysisManager();
        await manager.processDataset(assay, this.mockMPAConfig());
        return assay.dataRepository;
    }
}