import DataRepository from "./DataRepository";
import { GoNameSpace } from "../functional-annotations/GoNameSpace";
import GoTerm from "../functional-annotations/GoTerm";
import FATrust from "../functional-annotations/FATrust";
import { CachedDataSource } from "./CachedDataSource";
import { GeneOntology } from "../data-management/ontology/go/GeneOntology";
import { GOCountTable } from "../data-management/counts/GOCountTable";
import { ProcessedPeptideContainer } from "../data-management/ProcessedPeptideContainer";
import { PeptideData } from "../api/pept2data/Response";
import { DataSourceCommon } from "./DataSourceCommon";

/**
 * A GoDataSource can be used to access all GoTerms associated with a specific Sample. Note that this class contains
 * an extensive cache that reduces the amount of information that must be transfered between the server and the client's
 * browser.
 *
 * @see Sample
 */
export default class GoDataSource extends CachedDataSource<GoNameSpace, GoTerm> {
    private _countTable: GOCountTable;
    private _processedPeptideContainer: ProcessedPeptideContainer;
    private _baseUrl: string;

    constructor(countTable: GOCountTable, processedPeptideContainer: ProcessedPeptideContainer, repository: DataRepository, baseUrl: string) {
        super(repository);
        this._countTable = countTable;
        this._processedPeptideContainer = processedPeptideContainer;
        this._baseUrl = baseUrl;
    }

    public getPeptidesByGoTerm(term: GoTerm): string[] {
        return Array.from(this._countTable.ontology2peptide.get(term.code) || [])
    }

    public getGoTermSummary(term: GoTerm): string[][] {
        return DataSourceCommon.getFASummary(term, this._processedPeptideContainer);
    }

    /**
     * Get the n most popular GO-Terms for a specific namespace. The returned GO-Terms are sorted by popularity.
     *
     * @param n The amount of most popular GO-Terms that should be returned. If n is larger than the amount of terms
     * exist, all terms of the given namespace will be returned.
     * @param namespace The GO-namespace for which the most popular terms must be returned. Leave blanc if the most
     * popular terms over all namespaces must be returned.
     */
    public async getTopItems(n: number, namespace: GoNameSpace = null): Promise<GoTerm[]> {
        if (namespace) {
            const result: [GoTerm[], FATrust] = await this.getFromCache(namespace, Object.values(GoNameSpace));
            // The GO-Terms in the cache are sorted per namespace from high to low popularity. We can just return the first
            // n items of the found
            const list: GoTerm[] = result[0];
            return list.slice(0, Math.min(n, list.length));
        } else {
            const output: GoTerm[] = [];
            for (const ns of Object.values(GoNameSpace)) {
                const result: [GoTerm[], FATrust] = await this.getFromCache(ns, Object.values(GoNameSpace));
                if (result && result[0] && result[0].length > 0) {
                    output.push(...result[0].slice(0, Math.min(n, result[0].length)));
                }
            }

            return output.sort((a: GoTerm, b: GoTerm) => b.popularity - a.popularity).slice(0, Math.min(n, output.length));
        }
    }

    /**
     * Get all GO-terms for a specific cutoff, and taking into account only those sequences found in the given
     * sequences array.
     *
     * @param namespace the specific GO namespace for which GO-terms should be returned.
     * @param cutoff as percent (0-100)
     * @param sequences array of peptides to take into account
     */
    public async getGoTerms(namespace: GoNameSpace, cutoff: number = 50, sequences: string[] = null): Promise<GoTerm[]> {
        const result: [GoTerm[], FATrust] = await this.getFromCache(namespace, Object.values(GoNameSpace), cutoff, sequences);
        return result[0].sort((a: GoTerm, b: GoTerm) => b.popularity - a.popularity);
    }

    /**
     * Get the Trust level of some specific configuration for retrieving GO-terms.
     *
     * @param namespace
     * @param cutoff
     * @param sequences
     */
    public async getTrust(namespace: GoNameSpace = null, cutoff: number = 50, sequences: string[] = null): Promise<FATrust> {
        if (namespace) {
            const result: [GoTerm[], FATrust] = await this.getFromCache(namespace, Object.values(GoNameSpace), cutoff, sequences);
            return result[1];
        } else {
            const trusts: FATrust[] = [];
            for (const ns of Object.values(GoNameSpace)) {
                const result: [GoTerm[], FATrust] = await this.getFromCache(ns, Object.values(GoNameSpace), cutoff, sequences);
                trusts.push(result[1]);
            }
            return this.agregateTrust(trusts);
        }

    }

    // TODO: use percent in calculations
    protected async computeTerms(percent = 50, sequences = null): Promise<[Map<GoNameSpace, GoTerm[]>, Map<GoNameSpace, FATrust>]> {
        // first fetch Ontology data if needed
        var ontology: GeneOntology = this._countTable.getOntology()
        await ontology.fetchDefinitions(this._countTable.getOntologyIds(), this._baseUrl)

        var dataOutput: Map<GoNameSpace, GoTerm[]> = new Map()
        var trustOutput: Map<GoNameSpace, FATrust> = new Map()

        // calculate terms without peptide information if it is not available
        if (!this._processedPeptideContainer) {
            let namespaceCounts = new Map<string, number>()

            // first calculate the total counts for each namespace
            this._countTable.counts.forEach((count, term) => {
                let namespace = ontology.getDefinition(term).namespace
                namespaceCounts.set(namespace, (namespaceCounts.get(namespace) || 0) + count)
            })

            // create FATrusts for each namespace, at the same time init dataOutput arrays
            for (let namespace of Object.values(GoNameSpace)) {
                let namespaceCount = namespaceCounts.get(namespace) || 0
                trustOutput.set(namespace, new FATrust(namespaceCount, namespaceCount, 0));
                dataOutput.set(namespace, [])
            }

            // create GoTerms
            this._countTable.counts.forEach((count, term) => {
                let def = ontology.getDefinition(term)
                let namespaceCount = namespaceCounts.get(def.namespace)
                let goNameSpace: GoNameSpace = def.namespace as GoNameSpace

                let goTerm = new GoTerm(def.code, def.name, goNameSpace, count, count / namespaceCount, [])
                dataOutput.get(goNameSpace).push(goTerm);
            })

            // sort the GoTerms for each namespace
            for (let namespace of Object.values(GoNameSpace)) {
                dataOutput.set(namespace, dataOutput.get(namespace).sort((a, b) => b.popularity - a.popularity))
            }

            return [dataOutput, trustOutput];
        }

        var peptideCountTable = this._processedPeptideContainer.countTable

        if (sequences == null) {
            sequences = Array.from(this._processedPeptideContainer.response.keys())
        }

        for (let namespace of Object.values(GoNameSpace)) {
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
            
            // convert calculated data to GoTerms
            let convertedItems: GoTerm[] = [...termCounts].sort((a, b) => b[1] - a[1])
                .map(term => {
                    let code = term[0]
                    let count = term[1]
                    let ontologyData = ontology.getDefinition(code)
                    let fractionOfPepts = count / totalCount
                    return new GoTerm(code, ontologyData.name, namespace, count, fractionOfPepts, affectedPeptides.get(code))
                })

            dataOutput.set(namespace, convertedItems);
            // convert calculated data to FATrust
            trustOutput.set(namespace, new FATrust(annotatedCount, totalCount, trustCount));
        }

        return [dataOutput, trustOutput];
    }
}
