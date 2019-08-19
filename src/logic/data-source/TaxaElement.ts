import { TaxumRank } from './TaxumRank';
import Element from './Element';
import Sample from '../data-management/Sample';
import DataRepository from './DataRepository';
import TaxaDataSource from './TaxaDataSource';

export default class TaxaElement extends Element {
    public rank: TaxumRank;

    constructor(name: string, rank: TaxumRank, popularity: number) {
        super(name, popularity);
        this.rank = rank;
    }

    public async computeCrossPopularity(x: Element, sample: Sample): Promise<number> {
        const ownAffectedPeptides: string[] = await this.getAffectedPeptides(sample);
        const otherAffectedPeptides: string[] = await x.getAffectedPeptides(sample);
        return otherAffectedPeptides.reduce((acc: number, current: string) => acc + (ownAffectedPeptides.includes(current) ? 1 : 0), 0);
    }

    public async getAffectedPeptides(sample: Sample): Promise<string[]> {
        const dataRepository: DataRepository = sample.dataRepository;
        const taxaDataSource: TaxaDataSource = await dataRepository.createTaxaDataSource();
        return taxaDataSource.getAffectedPeptides(this);
    }
}
