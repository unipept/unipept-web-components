import ProteomicsAssay from "./ProteomicsAssay";
export default interface AssayVisitor {
    visitProteomicsAssay(mpAssay: ProteomicsAssay): Promise<void>;
}
