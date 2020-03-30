import DataRepository from "./DataRepository";
import TaxonomicsSummary from "./../data-source/TaxonomicSummary";
import { TaxumRank } from "./TaxumRank";
import { GoNameSpace } from "../functional-annotations/GoNameSpace";
import MetaProteomicsDataRepository from "./repository/MetaProteomicsDataRepository";
import { ProcessedPeptideContainer } from "../data-management/ProcessedPeptideContainer";
import { scaleQuantile } from "d3";
import { PeptideData } from "../api/pept2data/Response";

export default class ExportManager {
    // TODO this code should be cleaned up, once all the proteincounts are part of the data sources.
    public async exportResultsAsCsv(
        repo: MetaProteomicsDataRepository,
        separator: string = ",",
        goSeparator: string = ";"
    ): Promise<string> {
        const taxaSource = await repo.createTaxaDataSource();
        const taxos: TaxonomicsSummary[] = await taxaSource.getTaxonomicSummaries();

        const goSource = await repo.createGoDataSource();

        // These need to be manually specified here to retain a specific order!
        const goNameSpaces: GoNameSpace[] = [
            GoNameSpace.BiologicalProcess,
            GoNameSpace.CellularComponent,
            GoNameSpace.MolecularFunction
        ];

        let result: string =
            `peptide${separator}lca${separator}${Object.values(TaxumRank).join(separator)}${separator}EC${separator}${goNameSpaces.map(ns => `GO (${ns})`).join(separator)}\n`;

        const processedContainer: ProcessedPeptideContainer = await repo.initProcessedPeptideContainer();

        for (const tax of taxos) {
            // Process taxonomic information
            let row = tax.sequence + separator + tax.lcaName + separator + tax.lineageNames.map(e => {
                if (e === null) {
                    return "";
                } else {
                    return e;
                }
            }).join(separator);


            const peptData: PeptideData = processedContainer.response.get(tax.sequence);
            const dataList: {code: string, count: number}[] = [];

            for (const [key, value] of Object.entries(peptData.fa.data)) {
                dataList.push({
                    code: key,
                    count: parseInt(value as string)
                })
            }

            const ecNumbers = dataList.filter(x => x.code.startsWith("EC:")).sort((a, b) => b.count - a.count);

            row += separator;
            row += ecNumbers
                .slice(0, 3)
                .map(a => `${a.code.substr(3)} (${this.numberToPercent(a.count / peptData.fa.counts.EC)})`)
                .join(goSeparator);
            row += separator;

            row += (await Promise.all(goNameSpaces.map(async ns => {
                const goTerms = (await goSource.getGoTerms(ns, 0, [tax.sequence])).map(x => {
                    return dataList.find(y => y.code === x.code);
                }).sort((a, b) => b.count - a.count);

                return goTerms.slice(0, 3).map(a => `${a.code} (${this.numberToPercent(a.count / peptData.fa.counts.GO)})`).join(goSeparator);
            }))).join(separator);

            row += "\n";
            // Duplicate row in the case the peptide was more present more than once.
            result += row.repeat(processedContainer.countTable.get(tax.sequence));
        }

        return result;
    }

    private numberToPercent(n: number): string {
        return Math.round(n * 100) + "%";
    }
}
