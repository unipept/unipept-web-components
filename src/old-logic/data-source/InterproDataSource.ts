import DataRepository from "./DataRepository";
import { GoNameSpace } from "../functional-annotations/GoNameSpace";
import FATrust from "../functional-annotations/FATrust";
import { CachedDataSource } from "./CachedDataSource";
import { ProcessedPeptideContainer } from "../data-management/ProcessedPeptideContainer";
import { PeptideData } from "../api/pept2data/Response";
import { DataSourceCommon } from "./DataSourceCommon";
import { InterproNameSpace } from "../functional-annotations/InterproNameSpace";
import InterproEntry from "../functional-annotations/InterproEntry";
import { InterproCountTable } from "../data-management/counts/InterproCountTable";
import { InterproOntology } from "../data-management/ontology/interpro/InterproOntology";
import TreeViewNode from "./../../components/visualizations/TreeViewNode";
import InterproDefinition from "./../data-management/ontology/interpro/InterproDefinition";

/**
 * An InterproDataSource can be used to access all Interpro entries associated with a specific Assay. Note that this
 * class contains an extensive cache that reduces the amount of information that must be transfered between the server
 * and the client's browser.
 *
 * @see Assay
 */
export default class InterproDataSource extends CachedDataSource<InterproNameSpace, InterproEntry> {
    private _countTable: InterproCountTable;
    private _processedPeptideContainer: ProcessedPeptideContainer;
    private _baseUrl: string;

    constructor(countTable: InterproCountTable, processedPeptideContainer: ProcessedPeptideContainer, repository: DataRepository, baseUrl: string) {
        super(repository);
        this._countTable = countTable;
        this._processedPeptideContainer = processedPeptideContainer;
        this._baseUrl = baseUrl;
    }

    public getPeptidesByInterproEntry(term: InterproEntry): string[] {
        return Array.from(this._countTable.ontology2peptide.get(term.code) || [])
    }

    public getInterproSummary(term: InterproEntry): string[][] {
        return DataSourceCommon.getFASummary(term, this._processedPeptideContainer);
    }

    /**
     * Get the n most popular Interpro-entries for a specific namespace. The returned entries are sorted by popularity.
     *
     * @param n The amount of most popular Interpro-entries that should be returned. If n is larger than the amount of
     * terms that exist, all terms of the given namespace will be returned.
     * @param namespace The Interpro-namespace for which the most popular terms must be returned. Leave blank if the
     * most popular terms over all namespaces must be returned.
     */
    public async getTopItems(n: number, namespace: InterproNameSpace = null): Promise<InterproEntry[]> {
        if (namespace) {
            const result: [InterproEntry[], FATrust] = await this.getFromCache(namespace, Object.values(InterproNameSpace));
            // The GO-Terms in the cache are sorted per namespace from high to low popularity. We can just return the first
            // n items of the found
            const list: InterproEntry[] = result[0];
            return list.slice(0, Math.min(n, list.length));
        } else {
            const output: InterproEntry[] = [];
            for (const ns of Object.values(InterproNameSpace)) {
                const result: [InterproEntry[], FATrust] = await this.getFromCache(ns, Object.values(InterproNameSpace));
                if (result && result[0] && result[0].length > 0) {
                    output.push(...result[0].slice(0, Math.min(n, result[0].length)));
                }
            }

            return output.sort(
                (a: InterproEntry, b: InterproEntry) => b.popularity - a.popularity
            ).slice(0, Math.min(n, output.length));
        }
    }

    /**
     * Get all Interpro-entries for a specific cutoff, and taking into account only those sequences found in the given
     * sequences array.
     *
     * @param namespace the specific Interpro namespace for which Interpro-entries should be returned.
     * @param cutoff as percent (0-100)
     * @param sequences array of peptides to take into account
     */
    public async getInterproEntries(namespace: InterproNameSpace, cutoff: number = 50, sequences: string[] = null): Promise<InterproEntry[]> {
        if (namespace) {
            const result: [InterproEntry[], FATrust] = await this.getFromCache(namespace, Object.values(InterproNameSpace), cutoff, sequences);
            return result[0];
        } else {
            const output: InterproEntry[] = [];
            for (const ns of Object.values(InterproNameSpace)) {
                const result: [InterproEntry[], FATrust] = await this.getFromCache(ns, Object.values(InterproNameSpace), cutoff, sequences);
                output.push(... result[0]);
            }
            output.sort((a: InterproEntry, b: InterproEntry) => b.popularity - a.popularity);
            return output;
        }
    }

    /**
     * Get the Trust level of some specific configuration for retrieving GO-terms.
     *
     * @param namespace
     * @param cutoff
     * @param sequences
     */
    public async getTrust(namespace: InterproNameSpace = null, cutoff: number = 50, sequences: string[] = null): Promise<FATrust> {
        if (namespace) {
            const result: [InterproEntry[], FATrust] = await this.getFromCache(namespace, Object.values(InterproNameSpace), cutoff, sequences);
            return result[1];
        } else {
            const trusts: FATrust[] = [];
            for (const ns of Object.values(InterproNameSpace)) {
                const result: [InterproEntry[], FATrust] = await this.getFromCache(ns, Object.values(InterproNameSpace), cutoff, sequences);
                trusts.push(result[1]);
            }
            return this.agregateTrust(trusts);
        }

    }

    protected async computeTerms(percent = 50, sequences = null): Promise<[Map<InterproNameSpace, InterproEntry[]>, Map<InterproNameSpace, FATrust>]> {
        // first fetch Ontology data if needed
        const ontology: InterproOntology = this._countTable.getOntology();
        await ontology.fetchDefinitions(this._countTable.getOntologyIds(), this._baseUrl);

        const dataOutput: Map<InterproNameSpace, InterproEntry[]> = new Map();
        const trustOutput: Map<InterproNameSpace, FATrust> = new Map();

        // calculate terms without peptide information if it is not available
        if (!this._processedPeptideContainer) {
            let namespaceCounts = new Map<string, number>()

            // first calculate the total counts for each namespace
            this._countTable.counts.forEach((count, term) => {
                const namespace = ontology.getDefinition(term).namespace
                namespaceCounts.set(namespace, (namespaceCounts.get(namespace) || 0) + count)
            })

            // create FATrusts for each namespace, at the same time init dataOutput arrays
            for (let namespace of Object.values(InterproNameSpace)) {
                let namespaceCount = namespaceCounts.get(namespace) || 0
                trustOutput.set(namespace, new FATrust(namespaceCount, namespaceCount, 0));
                dataOutput.set(namespace, [])
            }

            // create InterproEntries
            this._countTable.counts.forEach((count, term) => {
                const def = ontology.getDefinition(term)
                const namespaceCount = namespaceCounts.get(def.namespace)
                const ns: InterproNameSpace = def.namespace as InterproNameSpace

                const entry = new InterproEntry(def, count, count / namespaceCount, [])
                dataOutput.get(ns).push(entry);
            })

            // sort the GoTerms for each namespace
            for (let namespace of Object.values(InterproEntry)) {
                dataOutput.set(namespace, dataOutput.get(namespace).sort((a, b) => b.popularity - a.popularity))
            }

            return [dataOutput, trustOutput];
        }

        const peptideCountTable = this._processedPeptideContainer.countTable

        if (sequences == null) {
            sequences = Array.from(this._processedPeptideContainer.response.keys())
        }

        for (let namespace of Object.values(InterproNameSpace)) {
            let totalCount = 0;
            let annotatedCount = 0;
            let trustCount = 0;

            let termCounts = new Map<string, number>()
            // TODO: this shouldn't be calculated here, but only when needed for the heatmap
            let affectedPeptides = new Map<string, string[]>()

            for (const pept of sequences) {
                let peptCount = peptideCountTable.get(pept)
                let peptideData: PeptideData = this._processedPeptideContainer.response.get(pept);
                let proteinCount = peptideData.fa.counts.GO;
                let trust = proteinCount / peptideData.fa.counts.all;

                totalCount += peptCount

                if (!this._countTable.peptide2ontology.has(pept)) {
                    continue;
                }

                let terms = this._countTable.peptide2ontology.get(pept).filter(term => ontology.getDefinition(term).namespace === namespace)
                let peptArray: string[] = Array(peptCount).fill(pept)
                let atLeastOne = false;

                for (const term of terms) {
                    let termProteinCount = peptideData.fa.data[term];
                    if (termProteinCount / proteinCount < percent / 100) {
                        continue;
                    }

                    atLeastOne = true;
                    termCounts.set(term, (termCounts.get(term) || 0) + peptCount)
                    affectedPeptides.set(term, (affectedPeptides.get(term) || []).concat(peptArray))
                }

                if (atLeastOne) {
                    trustCount += peptCount * trust;
                    annotatedCount += peptCount
                }
            }

            // convert calculated data to interpros
            let convertedItems: InterproEntry[] = [...termCounts].sort((a, b) => b[1] - a[1])
                .map(term => {
                    let code = term[0]
                    let count = term[1]
                    let ontologyData = ontology.getDefinition(code)
                    let fractionOfPepts = count / totalCount
                    const definition = new InterproDefinition(code, ontologyData.name, namespace);
                    return new InterproEntry(definition, count, fractionOfPepts, affectedPeptides.get(code))
                })

            dataOutput.set(namespace, convertedItems);
            // convert calculated data to FATrust
            trustOutput.set(namespace, new FATrust(annotatedCount, totalCount, trustCount));
        }

        return [dataOutput, trustOutput];
    }
}
