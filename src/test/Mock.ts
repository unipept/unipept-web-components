import Setup from "./Setup";
import ProteomicsAssay from "@/business/entities/assay/ProteomicsAssay";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";
import { CountTable } from "@/business/counts/CountTable";
import { Peptide } from "@/business/ontology/raw/Peptide";
import PeptideCountTableProcessor from "@/business/processors/raw/PeptideCountTableProcessor";
import Tree from "@/business/ontology/taxonomic/Tree";
import NcbiTaxon, { NcbiId } from "@/business/ontology/taxonomic/ncbi/NcbiTaxon";
import LcaCountTableProcessor from "@/business/processors/taxonomic/ncbi/LcaCountTableProcessor";
import { Ontology } from "@/business/ontology/Ontology";
import NcbiOntologyProcessor from "@/business/ontology/taxonomic/ncbi/NcbiOntologyProcessor";

export default class Mock {
    /**
     * Mocks an assay that contains real-world data, which could mainly be used for assessing the correctness of GUI
     * components. All calls to the Unipept-API that are required to process this assay will also be intercepted after
     * calling this function!
     */
    public mockRealisticAssay(): ProteomicsAssay {
        const setup = new Setup();
        setup.setupUnipeptNock();

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

        let output: ProteomicsAssay = new ProteomicsAssay(
            [],
            "1",
            new SearchConfiguration(),
            sequences,
            "Sample X",
            new Date("2019-10-21")
        );

        return output;
    }

    /**
     * Mock a fully computed peptide count table that's derived from a valid assay filled with real-world data.
     */
    public async mockRealisticPeptideCountTable(): Promise<CountTable<Peptide>> {
        const assay = this.mockRealisticAssay();
        const countTableProcessor = new PeptideCountTableProcessor();
        return await countTableProcessor.getPeptideCountTable(assay.getPeptides(), new SearchConfiguration());
    }

    public async mockRealisticLcaCountTable(): Promise<CountTable<NcbiId>> {
        const lcaCountTableProcessor = new LcaCountTableProcessor(await this.mockRealisticPeptideCountTable(), new SearchConfiguration());
        return await lcaCountTableProcessor.getCountTable();
    }

    public async mockRealisticNcbiOntology(): Promise<Ontology<NcbiId, NcbiTaxon>> {
        const lcaCounts = await this.mockRealisticLcaCountTable();
        const ontologyProcessor = new NcbiOntologyProcessor();
        return await ontologyProcessor.getOntology(lcaCounts);
    }

    public async mockRealisticTree(): Promise<Tree> {
        return new Tree(await this.mockRealisticLcaCountTable(), await this.mockRealisticNcbiOntology());
    }
}
