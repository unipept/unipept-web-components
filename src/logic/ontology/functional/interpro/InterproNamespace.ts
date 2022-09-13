enum InterproNamespace {
    ActiveSite = "active site",
    BindingSite = "binding site",
    ConservedSite = "conserved site",
    Domain = "domain",
    Family = "family",
    HomologousSuperfamily = "homologous superfamily",
    PTM = "ptm",
    Repeat = "repeat"
}

export function convertStringToInterproNamespace(ns: string): InterproNamespace {
    const mapping: Map<string, InterproNamespace> = new Map([
        ["active site", InterproNamespace.ActiveSite],
        ["binding site", InterproNamespace.BindingSite],
        ["conserved site", InterproNamespace.ConservedSite],
        ["domain", InterproNamespace.Domain],
        ["family", InterproNamespace.Family],
        ["homologous superfamily", InterproNamespace.HomologousSuperfamily],
        ["ptm", InterproNamespace.PTM],
        ["repeat", InterproNamespace.Repeat]
    ]);

    // @ts-ignore
    return mapping.get(ns.toLowerCase());
}

export default InterproNamespace;
