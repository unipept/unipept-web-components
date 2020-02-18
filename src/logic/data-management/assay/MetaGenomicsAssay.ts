import Assay from "./Assay";
import MPAConfig from "../MPAConfig";
import { TaxaCountTable } from "../counts/TaxaCountTable";
import { GOCountTable } from "../counts/GOCountTable";
import { ECCountTable } from "../counts/ECCountTable";

import AssayVisitor from "src/logic/data-management/assay/AssayVisitor";

export default class MetaGenomicsAssay extends Assay {
    private _taxaCountTable: TaxaCountTable;
    private _goCountTable: GOCountTable;
    private _ecCountTable: ECCountTable;

    async initDataRepository(mpaConfig: MPAConfig) {
        throw new Error("Method not implemented.");
    }

    async accept(visitor: AssayVisitor): Promise<void> {
        await visitor.visitMetaGenomicsAssay(this);
    }
}
