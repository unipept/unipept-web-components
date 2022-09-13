enum GoNamespace {
    CellularComponent = "cellular component",
    MolecularFunction = "molecular function",
    BiologicalProcess = "biological process",
}

export function convertStringToGoNamespace(input: string): GoNamespace | null {
    input = input.toLowerCase();
    // @ts-ignore
    for (const space of Object.values(GoNamespace).map(x => x.toString())) {
        if (space === input) {
            return space as GoNamespace;
        }
    }
    return null;
}

export default GoNamespace;
