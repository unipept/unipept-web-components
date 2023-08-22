declare enum EcNamespace {
    Oxidoreductases = "oxidoreductases",
    Transferases = "transferases",
    Hydrolases = "hydrolases",
    Lyases = "lyases",
    Isomerases = "isomerases",
    Ligases = "ligases",
    Translocases = "translocases"
}
/**
 * Converts a code in the form "EC:x.x.x.x" to the corresponding EcNameSpace.
 *
 * @param code The EC-Number for which the namespace should be computed.
 */
export declare function convertEcNumberToEcNamespace(code: string): EcNamespace;
export declare function convertStringToEcNamespace(ns: string): EcNamespace | null;
export default EcNamespace;
