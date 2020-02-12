import FileSystemAssayVisitor from "./FileSystemAssayVisitor";
import AssayVisitor from "../AssayVisitor";
import MetaProteomicsAssay from "../../MetaProteomicsAssay";
import MetaGenomicsAssay from "../../MetaGenomicsAssay";

export default class AssayFileSystemWriter extends FileSystemAssayVisitor implements AssayVisitor {
    visitMetaGenomicsAssay(mgAssay: MetaGenomicsAssay): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    visitMetaProteomicsAssay(mpAssay: MetaProteomicsAssay): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
