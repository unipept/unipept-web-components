import { TaxumRank } from "./TaxumRank";
import Element from "./Element";
import DataRepository from "./DataRepository";
import TaxaDataSource from "./TaxaDataSource";

export default class TaxaElement extends Element {
    public rank: TaxumRank;

    constructor(name: string, rank: TaxumRank, popularity: number) {
        super(name, popularity);
        this.rank = rank;
    }

    public async computeCrossPopularity(x: Element, dataRepository: DataRepository): Promise<number> {
        const ownAffectedPeptides: string[] = await this.getAffectedPeptides(dataRepository);
        const otherAffectedPeptides: string[] = await x.getAffectedPeptides(dataRepository);
        return otherAffectedPeptides.reduce((acc: number, current: string) => acc + (ownAffectedPeptides.includes(current) ? 1 : 0), 0);
    }

    public async getAffectedPeptides(dataRepository: DataRepository): Promise<string[]> {
        const taxaDataSource: TaxaDataSource = await dataRepository.createTaxaDataSource();
        return taxaDataSource.getAffectedPeptides(this);
    }
}
