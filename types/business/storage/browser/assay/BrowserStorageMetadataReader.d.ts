import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
import BrowserAssayVisitor from "./BrowserAssayVisitor";
export default class BrowserStorageMetadataReader extends BrowserAssayVisitor {
    visitProteomicsAssay(assay: ProteomicsAssay): Promise<void>;
}
