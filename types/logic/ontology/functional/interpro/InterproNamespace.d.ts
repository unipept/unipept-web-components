declare enum InterproNamespace {
    ActiveSite = "active site",
    BindingSite = "binding site",
    ConservedSite = "conserved site",
    Domain = "domain",
    Family = "family",
    HomologousSuperfamily = "homologous superfamily",
    PTM = "ptm",
    Repeat = "repeat",
    Unknown = "unknown"
}
export declare function convertStringToInterproNamespace(ns: string): InterproNamespace;
export default InterproNamespace;
