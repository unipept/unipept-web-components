import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
import BrowserAssayVisitor from "./BrowserAssayVisitor";
export default class BrowserStorageDataReader extends BrowserAssayVisitor {
    visitProteomicsAssay(mpAssay: ProteomicsAssay): Promise<void>;
}
