import DataRepository from "./DataRepository";
import TaxonomicsSummary from "./../data-source/TaxonomicSummary";
import { TaxumRank } from "./TaxumRank";
import { GoNameSpace } from "../functional-annotations/GoNameSpace";

export default class ExportManager {
    public async exportResultsAsCsv(repo: DataRepository): Promise<string> {
        const taxaSource = await repo.createTaxaDataSource();
        const taxos: TaxonomicsSummary[] = await taxaSource.getTaxonomicSummaries();

        const ecSource = await repo.createEcDataSource();
        const goSource = await repo.createGoDataSource();

        let result: string = 
            "peptide,lca," + Object.values(TaxumRank).join(",") + "," + "EC," + 
            Object.values(GoNameSpace).map(ns => `GO (${ns})`).join(",") + "\n";

        for (const tax of taxos) {
            // Process taxonomic information
            let row = tax.sequence + "," + tax.lcaName + "," + tax.lineageNames.map(e => {
                if (e === null) {
                    return "";
                } else {
                    return e;
                }
            }).join(",");

            const ecNumbers = await ecSource.getEcNumbers(undefined, 0, [tax.sequence]);

            row += ",";
            row += ecNumbers.slice(0, 3).map(a => `${a.code}`).join(";");
            row += ",";
            // row += peptide.faGrouped.EC.sort((a, b) => b.value - a.value)
            //     .slice(0, 3)
            //     .map(a => `${a.code} (${numberToPercent(a.value / peptide.fa.counts.EC)})`)
            //     .join(";");
            // row += ",";

            for (const ns of [GoNameSpace.CellularComponent, GoNameSpace.MolecularFunction, GoNameSpace.BiologicalProcess]) {
                const goTerms = await goSource.getGoTerms(ns, 0, [tax.sequence]);
                row += goTerms.slice(0, 3).map(a => `${a.code}`).join(";");
                row += ",";
            }
    
            // row += GOTerms.NAMESPACES.map(ns =>
            //     (peptide.faGrouped.GO[ns] || [])
            //         .sort((a, b) => b.value - a.value)
            //         .slice(0, 3)
            //         .map(a => `${a.code} (${numberToPercent(a.value / peptide.fa.counts.GO)})`)
            //         .join(";"))
            //     .join(",");

            result += row + "\n";
        }

        console.log(result);
        return result;
    }
}
