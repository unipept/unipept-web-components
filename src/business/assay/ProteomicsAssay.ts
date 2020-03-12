import Assay from "@/business/assay/Assay";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";

export default class ProteomicsAssay extends Assay {
    constructor(
        protected readonly changeListeners: ChangeListener<Assay>[],
        public readonly id: string,
        public readonly peptides: string[],
        protected searchConfiguration: SearchConfiguration,
        protected name?: string,
        protected date?: Date,
    ) {
        super(changeListeners, id, name, date);
    }

    public getSearchConfiguration(): SearchConfiguration {
        return this.searchConfiguration;
    }

    public setSearchConfiguration(value: SearchConfiguration) {
        super.onUpdate("searchConfiguration", this.searchConfiguration, value);
        this.searchConfiguration = value;
    }

    async accept(visitor: AssayVisitor): Promise<void> {
        await visitor.visitMetaProteomicsAssay(this);
    }
}
