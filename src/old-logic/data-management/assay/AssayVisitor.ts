import MetaGenomicsAssay from "./MetaGenomicsAssay";
import MetaProteomicsAssay from "./MetaProteomicsAssay";

export default interface AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void>;
    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay) : Promise<void>;
}
