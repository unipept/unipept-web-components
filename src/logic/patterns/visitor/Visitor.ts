import MetaGenomicsAssay from "../../data-management/assay/MetaGenomicsAssay";
import MetaProteomicsAssay from "../../data-management/assay/MetaProteomicsAssay";

export default interface Visitor
{
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void>;
    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay) : Promise<void>;
}
