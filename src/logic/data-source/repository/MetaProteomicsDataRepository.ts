import MPAConfig from "../../data-management/MPAConfig";
import DataRepository from "../DataRepository";
import GoDataSource from "./../GoDataSource";
import TaxaDataSource from "./../TaxaDataSource";
import EcDataSource from "./../EcDataSource";

import { PeptideContainerProcessor } from "../../processors/peptide/container/PeptideContainerProcessor";
import { ProcessedPeptideContainer } from "../../data-management/ProcessedPeptideContainer";
import { TaxaPeptideProcessor } from "../../processors/peptide/TaxaPeptideProcessor"
import { GOPeptideProcessor } from "../../processors/peptide/GOPeptideProcessor";
import { ECPeptideProcessor } from "../../processors/peptide/ECPeptideProcessor";
import MetaProteomicsAssay from "../../data-management/assay/MetaProteomicsAssay";
import { PeptideData } from "../../api/pept2data/Response";
import { Ontologies } from "../../data-management/ontology/Ontologies";

export default class MetaProteomicsDataRepository extends DataRepository {
    private _metaproteomicsAssay: MetaProteomicsAssay;

    private _processor: PeptideContainerProcessor;
    private _processedPeptideContainer: Promise<ProcessedPeptideContainer>;

    private _mpaConfig: MPAConfig;
    private _baseUrl: string;

    public constructor(metaProteomicsAssay: MetaProteomicsAssay, mpaConfig: MPAConfig, baseUrl: string) {
        super()
        
        this._metaproteomicsAssay = metaProteomicsAssay;

        this._processor = new PeptideContainerProcessor();
        this._processor.registerProgressListener(metaProteomicsAssay);

        this._mpaConfig = mpaConfig;

        this._baseUrl = baseUrl;
    }

    protected async initTaxaDataSource(): Promise<void> {
        let processedPeptideContainer = await this._processedPeptideContainer;

        this._taxaSourceCache = new TaxaDataSource(
            TaxaPeptideProcessor.process(processedPeptideContainer), 
            processedPeptideContainer,
            this,
            this._baseUrl
        );
    }

    protected async initGoDataSource(): Promise<void> {
        let processedPeptideContainer = await this._processedPeptideContainer;
        this._goSourceCache = new GoDataSource(
            GOPeptideProcessor.process(processedPeptideContainer),
            processedPeptideContainer, 
            this,
            this._baseUrl
        );
    }

    protected async initEcDataSource(): Promise<void> {
        let processedPeptideContainer = await this._processedPeptideContainer;
        this._ecSourceCache = new EcDataSource(
            ECPeptideProcessor.process(processedPeptideContainer),
            processedPeptideContainer,
            this,
            this._baseUrl
        );
    }

    async initProcessedPeptideContainer() : Promise<ProcessedPeptideContainer> {
        if (!this._processedPeptideContainer) {
            this._processedPeptideContainer = this.processPeptideContainer()
        }

        return this._processedPeptideContainer;
    }

    private async processPeptideContainer() {
        let processedPeptideContainer = await this._processor.process(this._metaproteomicsAssay.peptideContainer, this._mpaConfig, this._baseUrl)
        let lcas = [];

        // set lineages in ncbiTaxonomy
        processedPeptideContainer.response.forEach((data: PeptideData) => {
            Ontologies.ncbiTaxonomy.setLineage(data.lca, data.lineage);
            lcas.push(data.lca)
        });

        // fetch taxa info for these lcas
        await Ontologies.ncbiTaxonomy.fetchTaxaInfo(lcas, this._baseUrl);

        return processedPeptideContainer;
    }
}
