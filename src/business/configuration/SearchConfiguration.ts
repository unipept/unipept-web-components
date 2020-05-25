import Visitable from "../visitor/Visitable";
import SearchConfigurationVisitor from "./SearchConfigurationVisitor";

export default class SearchConfiguration implements Visitable<SearchConfigurationVisitor> {
    constructor(
        public equateIl: boolean = true,
        public filterDuplicates: boolean = true,
        public enableMissingCleavageHandling: boolean = false,
        public id?: string
    ) {}

    public toString() {
        return [this.equateIl, this.filterDuplicates, this.enableMissingCleavageHandling].map(
            t => t.toString()
        ).join(",");
    }

    public async accept(visitor: SearchConfigurationVisitor): Promise<void> {
        visitor.visitSearchConfiguration(this);
    }
}

