import DataRepository from './DataRepository';
import { GoNameSpace } from '../functional-annotations/GoNameSpace';
import DataSource from './DataSource';
import GoTerm from '../functional-annotations/GoTerm';
import FATrust from '../functional-annotations/FATrust';
import sha256 from 'crypto-js/sha256';
import { MPAFAResult } from '../data-management/newworker.js';
import { CachedDataSource } from './CachedDataSource';

/**
 * A GoDataSource can be used to access all GoTerms associated with a specific Sample. Note that this class contains
 * an extensive cache that reduces the amount of information that must be transfered between the server and the client's
 * browser.
 *
 * @see Sample
 */
export default class GoDataSource extends CachedDataSource<GoNameSpace, GoTerm>  {
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
        return result[0];
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

    protected async computeTerms(percent = 50, sequences = null): Promise<[Map<GoNameSpace, GoTerm[]>, Map<GoNameSpace, FATrust>]> {
        const worker = await this._repository.getWorker();

        const {data, trust} = await worker.summarizeGo(percent, sequences);

        const dataOutput: Map<GoNameSpace, GoTerm[]> = new Map();
        for (const namespace of Object.values(GoNameSpace)) {
            const items: MPAFAResult[] = data[namespace];
            const convertedItems: GoTerm[] = [];
            for (const item of items) {
                const affectedPeptides: string[] = [];
                for (const seq of Object.keys(item.sequences)) {
                    if (item.sequences.hasOwnProperty(seq)) {
                        for (let i = 0; i < item.sequences[seq]; i++) {
                            affectedPeptides.push(seq);
                        }
                    }
                }

                convertedItems.push(new GoTerm(item.code, item.name, namespace, item.numberOfPepts, item.fractionOfPepts, affectedPeptides));
            }
            dataOutput.set(namespace, convertedItems);
        }

        const trustOutput: Map<GoNameSpace, FATrust> = new Map();
        for (const namespace of Object.values(GoNameSpace)) {
            const originalTrust: {trustCount: number, annotatedCount: number, totalCount: number} = trust[namespace];
            const convertedTrust: FATrust = new FATrust(originalTrust.annotatedCount, originalTrust.totalCount, originalTrust.trustCount);
            trustOutput.set(namespace, convertedTrust);
        }

        return [dataOutput, trustOutput];
    }
}
