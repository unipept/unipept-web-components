import Sample from '../data-management/Sample';
import ProgressListener from '../patterns/ProgressListener';
import ProgressPublisher from '../patterns/ProgressPublisher';
import MPAConfig from '../data-management/MPAConfig';

import TaxaDataSource from './TaxaDataSource';
import GoDataSource from './GoDataSource';
import EcDataSource from './EcDataSource';

import { PeptideContainerProcessor } from '../processors/peptide/container/PeptideContainerProcessor';
import { ProcessedPeptideContainer } from '../data-management/ProcessedPeptideContainer';
import { TaxaPeptideProcessor } from '../processors/peptide/TaxaPeptideProcessor';
import { GOPeptideProcessor } from '../processors/peptide/GOPeptideProcessor';
import { ECPeptideProcessor } from '../processors/peptide/ECPeptideProcessor';
import { Ontologies } from "../data-management/ontology/Ontologies";
import { PeptideData } from '../api/pept2data/Response';

export default class DataRepository extends ProgressPublisher implements ProgressListener
{
    private readonly _sample: Sample;

    private _processor: PeptideContainerProcessor;
    private _processedPeptideContainer: Promise<ProcessedPeptideContainer>;

    private _mpaConfig: MPAConfig;

    private _taxaSourceCache: TaxaDataSource;
    private _goSourceCache: GoDataSource;
    private _ecSourceCache: EcDataSource;

    public constructor(sample: Sample, mpaConfig: MPAConfig) 
    {
        super();

        this._processor = new PeptideContainerProcessor();
        this._processor.registerProgressListener(this);

        this._sample = sample;
        this._mpaConfig = mpaConfig;
    }

    public async createTaxaDataSource(): Promise<TaxaDataSource> {
        if (!this._taxaSourceCache) 
        {
            let processedPeptideContainer = await this._processedPeptideContainer;
            // set lineages already calculated in the global NCBITaxonomy Ontology
            processedPeptideContainer.response.response.forEach((data: PeptideData) => {
                Ontologies.ncbiTaxonomy.setLineage(data.lca, data.lineage);
            });

            this._taxaSourceCache = new TaxaDataSource(
                TaxaPeptideProcessor.process(processedPeptideContainer), this);
        }
        return this._taxaSourceCache;
    }

    /**
     * Creates a new GoDataSource, or returns one from the cache if the requested namespace was already queried.
     */
    public async createGoDataSource(): Promise<GoDataSource> {
        if (!this._goSourceCache) 
        {
            let processedPeptideContainer = await this._processedPeptideContainer;
            this._goSourceCache = new GoDataSource(
                GOPeptideProcessor.process(processedPeptideContainer),
                processedPeptideContainer, 
                this
            );
        }
        return this._goSourceCache;
    }

    public async createEcDataSource(): Promise<EcDataSource> {
        if (!this._ecSourceCache) 
        {
            let processedPeptideContainer = await this._processedPeptideContainer;
            this._ecSourceCache = new EcDataSource(
                ECPeptideProcessor.process(processedPeptideContainer),
                processedPeptideContainer,
                this
            );
        }
        return this._ecSourceCache;
    }
    
    public async getProcessedPeptideContainer() : Promise<ProcessedPeptideContainer> 
    {
        if (!this._processedPeptideContainer) {
            this._processedPeptideContainer = this._processor.process(this._sample.peptideContainer, this._mpaConfig);
        }
        return this._processedPeptideContainer;
    }

    onProgressUpdate(progress: number): void 
    {
        this.updateProgress(progress)
    }
}
