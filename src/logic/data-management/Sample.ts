import {FunctionalAnnotations} from '../functional-annotations/FunctionalAnnotations.js';
import Resultset from './Resultset';
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
    public fa: FunctionalAnnotations;
    public baseFa: FunctionalAnnotations;
    public id: string;
    public taxonMap: Map<number, TaxonInfo>;
    public resultSet: Resultset;

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
        this.fa = null;
        this.baseFa = null;
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
     * Sets the current FA summary as base, accessible trough baseFa.
     */
    public setBaseFA() {
        this.baseFa = this.fa.clone();
    }

    /**
     * Creates a tree like structure, that is this.tree where each node has an
     * `included` property. This property indicates if this node or any of its
     * children contain the, sought for, functional annotation (code).
     *
     * @param code The FA term to look for
     * @return A taxon tree-like object annotated with `included`
     */
    public async getFATree(code: string): Promise<object> {
        const pepts = (await this.getPeptidesByFA(code, null)).map((pept) => pept.sequence);
        return this.tree.getRoot().callRecursivelyPostOder((t, c) => {
            const included = c.some((x) => x.included) || t.values.some((pept) => pepts.includes(pept.sequence));
            return Object.assign(Object.assign({}, t), {included, children: c});
        });
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
     * Converts the current analysis to the csv format. Each row contains a
     * peptide and its lineage, with each column being a level in the taxonomy
     *
     * @return The analysis result in csv format
     */
    public async toCSV(): Promise<string> {
        return this.resultSet.toCSV();
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

    /**
     * Returns the number of searched for peptides, taking the deduplication
     * setting into account.
     *
     * @return The number of searched for peptides
     */
    public getNumberOfSearchedForPeptides(): number {
        return this.resultSet.getNumberOfSearchedForPeptides();
    }

    /**
     * Returns the list of unmached peptides for the current resultset
     *
     * @return An array of peptides without match
     */
    public getMissedPeptides(): string[] {
        return this.resultSet.missedPeptides;
    }

    /**
     * Returns a list of sequences that have the specified FA term
     * @param faName The name of the FA term (GO:000112, EC:1.5.4.1)
     * @param sequences List of sequences to limit to
     * @return A list of objects representing the matches
     */
    public getPeptidesByFA(faName: string, sequences: string[]): Promise<Array<{sequence, hits, type, annotatedCount, allCount, relativeCount, count}>>  {
        return this.resultSet.getPeptidesByFA(faName, sequences);
    }
}
