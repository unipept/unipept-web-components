import MetaGenomicsAssay from "src/logic/data-management/assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "src/logic/data-management/assay/MetaProteomicsAssay";

export default interface AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void>;
    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay) : Promise<void>;
}
