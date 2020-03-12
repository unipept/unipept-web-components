export enum EcNamespace {
    // EC 1.x.x.x class
    Oxidoreductases = "oxidoreductases",
    // EC 2.x.x.x class
    Transferases = "transferases",
    // EC 3.x.x.x class
    Hydrolases = "hydrolases",
    // EC 4.x.x.x class
    Lyases = "lyases",
    // EC 5.x.x.x class
    Isomerases = "isomerases",
    // EC 6.x.x.x class
    Ligases = "ligases",
    // EC 7.x.x.x class
    Translocases = "translocases",
}

/**
 * Converts a code in the form "EC:x.x.x.x" to the corresponding EcNameSpace.
 *
 * @param code The EC-Number for which the namespace should be computed.
 */
export function convertEcNumberToEcNamespace(code: string): EcNamespace {
    return Object.values(EcNamespace)[parseInt(code.substr(0, 1)) - 1];
}

export function convertStringToEcNamespace(ns: string): EcNamespace {
    ns = ns.toLowerCase();
    for (const space of Object.values(EcNamespace)) {
        if (ns === space) {
            return space;
        }
    }
    return null;
}
