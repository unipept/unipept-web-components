import {FunctionalAnnotations} from "@/logic/functional-annotations/FunctionalAnnotations";
import {numberToPercent} from "@/logic/utils";
import GoTerm from "@/logic/functional-annotations/GoTerm";

export default class FaSortSettings {
    public format: (x: GoTerm) => string;
    public field: string;
    public shadeField: string;
    public name: string;
    public sortFunc: (a: FAInfo, b: FAInfo) => number;

    constructor(
        format: (x: GoTerm) => string,
        field: string,
        shadeField: string,
        name: string,
        sortFunc: (a: FAInfo, b: FAInfo) => number
    ) {
        this.format = format;
        this.field = field;
        this.shadeField = shadeField;
        this.name = name;
        this.sortFunc = sortFunc;
    }
}
