import Element from "./../Element";
import DataRepository from "./../DataRepository";
import TaxaDataSource from "./../TaxaDataSource";
import NCBITaxon from "./../../data-management/ontology/taxa/NCBITaxon";

export default class NCBIAnnotation extends Element {
    public definition: NCBITaxon;

    constructor(definition: NCBITaxon, popularity: number) {
        super(definition.name, popularity);
        this.definition = definition;
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
