import FunctionalDefinition from "./../../business/ontology/functional/FunctionalDefinition";
export default class TableItem {
    readonly count: number;
    readonly relativeCount: number;
    readonly name: string;
    readonly code: string;
    readonly definition: FunctionalDefinition;
    constructor(count: number, relativeCount: number, name: string, code: string, definition: FunctionalDefinition);
}
