import GOAnnotation from "../../logic/functional-annotations/GOAnnotation";
import FAInfo from "../../logic/data-management/FAInfo";

export default class FaSortSettings {
    public format: (x: GOAnnotation) => string;
    public field: string;
    public shadeField: string;
    public name: string;
    public sortFunc: (a: FAInfo, b: FAInfo) => number;

    constructor(
        format: (x: GOAnnotation) => string,
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
