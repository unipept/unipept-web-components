export enum GoNamespace {
    CellularComponent = "cellular component",
    MolecularFunction = "molecular function",
    BiologicalProcess = "biological process",
}

export function convertStringToGoNamespace(input: string): GoNamespace {
    input = input.toLowerCase();
    for (const space of Object.values(GoNamespace)) {
        if (space === input) {
            return space;
        }
    }
    return null;
}
