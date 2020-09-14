import Visitable from "../visitor/Visitable";
import SearchConfigurationVisitor from "./SearchConfigurationVisitor";
export default class SearchConfiguration implements Visitable<SearchConfigurationVisitor> {
    equateIl: boolean;
    filterDuplicates: boolean;
    enableMissingCleavageHandling: boolean;
    id?: string;
    constructor(equateIl?: boolean, filterDuplicates?: boolean, enableMissingCleavageHandling?: boolean, id?: string);
    toString(): string;
    accept(visitor: SearchConfigurationVisitor): Promise<void>;
}
