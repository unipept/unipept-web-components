declare enum GoNamespace {
    CellularComponent = "cellular component",
    MolecularFunction = "molecular function",
    BiologicalProcess = "biological process"
}
export declare function convertStringToGoNamespace(input: string): GoNamespace | null;
export default GoNamespace;
