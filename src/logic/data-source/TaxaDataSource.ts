import DataSource from "./DataSource";
import TaxaElement from "./TaxaElement";
import Tree from "../data-management/Tree";
import { Node } from "../data-management/Node";

import DataRepository from "./DataRepository";

import { TaxumRank, convertStringToTaxumRank } from "./TaxumRank";
import { TaxaCountTable } from "../data-management/counts/TaxaCountTable";
import { TaxaCountProcessor } from "../processors/count/TaxaCountProcessor";
import { ProcessedPeptideContainer } from "../data-management/ProcessedPeptideContainer";
import { GoNameSpace } from "../functional-annotations/GoNameSpace";

export default class TaxaDataSource extends DataSource {
    private _countTable: TaxaCountTable;
    private _processedPeptideContainer: ProcessedPeptideContainer;

    private _tree: Tree;
    // These are the peptides that couldn't be matched with the database.
    private _missedPeptides: string[];
    // The amount of peptides that were found in the database.
    private _matchedPeptides: number;
    // The amount of peptides that have been looked up in the database. This is the total amount of peptides that were
    // searched.
    private _searchedPeptides: number;
    private _baseUrl: string;
 
    constructor(countTable: TaxaCountTable, processedPeptideContainer: ProcessedPeptideContainer, repository: DataRepository, baseUrl: string) {
        super(repository);
        this._countTable = countTable;
        this._processedPeptideContainer = processedPeptideContainer;
        this._baseUrl = baseUrl;
    }

    /**
     * Get the n most popular items from this DataSource. The popularity is based on the amount of peptides that
     * associated with a particular DataElement.
     * 
     * @param n The amount of items that should be listed. If n is larger than the amount of available items in this
     * DataSource, all items will be returned. The returned list is sorted on the amount of peptides associated with 
     * each item.
     * @param level The TaxumRank with whome the returned TaxaElement's must be associated. 
     */
    public async getTopItems(n: number, level: TaxumRank = null): Promise<TaxaElement[]> {
        await this.process();
        if (level) {
            let output: TaxaElement[] = [];

            let nodes: Set<Node> = this._tree.getNodesWithRank(level);
            if (!nodes) {
                return [];
            }

            for (let node of nodes) {
                output.push(new TaxaElement(node.name, level, node.data.count));
            }
            return output;
        } else {
            let output: TaxaElement[] = [];

            let nodes: Set<Node> = this._tree.getAllNodes();
            if (!nodes) {
                return [];
            }

            for (let node of nodes) {
                output.push(new TaxaElement(node.name, convertStringToTaxumRank(node.rank), node.data.count));
            }
            return output;
        }
    }

    /**
     * @return A tree based on all peptides associated with this DataSource. No filtering has been performed whatsoever.
     */
    public async getTree(): Promise<Tree> {
        await this.process();
        return this._tree;
    }
    
    public async getTreeByPeptides(peptides: string[]) : Promise<Node> {
        await this.process();
        return this._tree.getRoot().callRecursivelyPostOder((t: Node, c: any) => {
            const included = c.some(x => x.included) || t.values.some(pept => peptides.includes(pept));
            return Object.assign(Object.assign({}, t), { included: included, children: c });
        });
    }

    public async getAffectedPeptides(element: TaxaElement): Promise<string[]> {
        await this.process();
        // TODO enumerating all nodes here should not be necessary!
        let nodesForRank: Set<Node> = this._tree.getNodesWithRank(element.rank);
        for (let node of nodesForRank) {
            if (node.name === element.name) {                
                return this._tree.getAllSequences(node.id);
            }
        }
        return [];
    }

    public getNrOfPeptidesByTaxonId(taxonId: number) : number {
        if (this._tree.nodes.has(taxonId)) {
            return this._tree.nodes.get(taxonId).data.count;
        }

        return 0;
    }

    public async getMissedPeptides(): Promise<string[]> {
        await this.process();
        return this._missedPeptides;
    }

    public async getAmountOfMatchedPeptides(): Promise<number> {
        await this.process();
        return this._matchedPeptides;
    }

    public async getAmountOfSearchedPeptides(): Promise<number> {
        await this.process();
        return this._searchedPeptides;
    }

    /**
     * @return a string representing a CSV file that contains a summary of all LCA-related information.
     */
    public async toCSV(): Promise<string> {
        await this.process();
        let result = 
            "peptide,lca," + Object.values(TaxumRank).join(",") + "," + "EC," + 
            Object.values(GoNameSpace).map(ns => `GO (${ns})`).join(",") + "\n";

        const tree: Tree = await this.getTree();

        for (const peptide of tree.getAllSequences(tree.getRoot().id)) {
            let row = peptide + ",";
    
            // row += taxonMap.get(peptide.lca).name + ",";
            // row += peptide.lineage.map(e => {
            //     if (e === null) return "";
            //     return taxonMap.get(e).name;
            // }).join(",");
    
    
            // row += ",";
            // row += peptide.faGrouped.EC.sort((a, b) => b.value - a.value)
            //     .slice(0, 3)
            //     .map(a => `${a.code} (${numberToPercent(a.value / peptide.fa.counts.EC)})`)
            //     .join(";");
            // row += ",";
    
            // row += GOTerms.NAMESPACES.map(ns =>
            //     (peptide.faGrouped.GO[ns] || [])
            //         .sort((a, b) => b.value - a.value)
            //         .slice(0, 3)
            //         .map(a => `${a.code} (${numberToPercent(a.value / peptide.fa.counts.GO)})`)
            //         .join(";"))
            //     .join(",");
    
            row += "\n";
            result += row;
            // result += row.repeat(peptide.count);
        }
        console.log(result);
        return result;
    }

    private async process(): Promise<void> {
        if (!this._tree || !this._missedPeptides || this._matchedPeptides === undefined || this._searchedPeptides === undefined) {
            this._tree = await TaxaCountProcessor.process(this._countTable, this._baseUrl);

            this._missedPeptides = this._processedPeptideContainer.missed;
            this._matchedPeptides = this._processedPeptideContainer.numMatched;
            this._searchedPeptides = this._processedPeptideContainer.numSearched;
        }
    }
}
