import {postJSON} from '../utils';
import Tree from './Tree';
import DataRepository from '../data-source/DataRepository';
import ProgressListener from './ProgressListener';
import MPAConfig from './MPAConfig';
import TaxonInfo from './TaxonInfo';

export default class Sample {

    get dataRepository(): DataRepository {
        return this._dataRepository;
    }
    public static readonly TAXA_URL: string = '/private_api/taxa';

    /**
     * Fetches the taxon info from the Unipept API for a list of taxon id's and
     * returns an Array of objects containing the id, name and rank for each
     * result.
     *
     * @param taxids Array containing taxon id integers
     * @return containing an array of result objects
     * with id, name and rank fields
     */
    public static getTaxonInfo(taxids: number[]): Promise<TaxonInfo[]> {
        return postJSON(Sample.TAXA_URL, JSON.stringify({taxids}));
    }

    /**
     * Converts a list of peptides to uppercase
     *
     * @param peptides a list of peptides
     * @return The converted list
     */
    public static cleanPeptides(peptides: string[]): string[] {
        return peptides.map((p) => p.toUpperCase());
    }

    public tree: Tree;
    public originalPeptides: string[];
    public id: string;
    public taxonMap: Map<number, TaxonInfo>;

    private _dataRepository: DataRepository;

    /**
     * Creates a Dataset object based on a list of peptides
     *
     * @param {string[]} [peptides=[]] A list of peptides (strings)
     * @param {string} id Unique identifier associated with this Dataset.
     */
    constructor(peptides: string[], id: string, mpaConfig: MPAConfig, progressListener: ProgressListener) {
        this.originalPeptides = Sample.cleanPeptides(peptides);

        this.tree = null;
        this.id = id;

        this.taxonMap = new Map();
        this.taxonMap.set(1, {id: 1, rank: 'no rank', name: 'root'});

        this._dataRepository = new DataRepository(this, mpaConfig);
        this._dataRepository.registerProgressListener(progressListener);
    }

    public getTree(): Tree {
        return this.tree;
    }

    /**
     * Adds new taxon info to the global taxon map
     *
     * @param taxonInfo A list of new taxon info
     */
    public addTaxonInfo(taxonInfo: TaxonInfo[]) {
        for (const t of taxonInfo) {
            this.taxonMap.set(t.id, t);
        }
    }

    /**
     * Returns the number of matched peptides, taking the deduplication setting
     * into account.
     *
     * @return The number of matched peptides
     */
    public getNumberOfMatchedPeptides(): number {
        return this.tree.root.data.count;
    }
}
